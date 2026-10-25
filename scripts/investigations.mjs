import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table} from './lib/format.mjs';

export const reports={
 'case-load':'select * from v_case_load order by due_on nulls first,code',
 'actions-due':'select * from v_actions_due order by due_on nulls first,case_code,name',
 'interviews-due':'select * from v_interviews_due order by scheduled_at',
 'custody-review':'select * from v_custody_review order by review_on,code',
 'retention-review':'select * from v_retention_review order by review_on nulls first,code',
 'party-links':'select * from v_party_links where cases>1 order by code',
 'attention':`select code,name,owner,priority,due_on,concat_ws('; ',case when owner='' then 'Assign owner' end,case when due_on<current_date then 'Case overdue' end,case when reviewed_at is null then 'Review intake' when reviewed_at<now()-interval '14 days' then 'Review gone quiet' end) as needs from cases where status='open' and (owner='' or due_on<current_date or reviewed_at is null or reviewed_at<now()-interval '14 days') order by code`
};
export const specs={
 help:[],list:['status'],show:['kind','ref'],...Object.fromEntries(Object.keys(reports).map(k=>[k,[]])),
 chronology:['ref'],compliance:[],'weekly-review':[],
 'add-case':['code','name','owner','purpose','due','review','priority','actor'],
 'review-case':['ref','owner','purpose','due','review','priority','hold','reason','actor'],
 'add-action':['ref','name','owner','due','actor'],'complete-action':['ref','result','actor'],
 'add-party':['code','name','actor'],'link-party':['ref','party','role','basis','actor'],
 'add-interview':['ref','party','name','owner','at','actor'],'record-interview':['ref','status','note','actor'],
 'add-evidence':['ref','code','name','holder','location','file','basis','review','actor'],
 'transfer-evidence':['ref','from','to','location','reason','actor'],'return-evidence':['ref','from','to','location','reason','actor'],'review-evidence':['ref','disposition','reason','review','actor'],
 log:['ref','name','note','actor'],'close-case':['ref','conclusion','actor'],'reopen-case':['ref','reason','actor'],
 import:['dir','file','dry-run','actor'],export:['out'],'draft-brief':['ref','out']
};
export const commands=Object.keys(specs);
const kinds={cases:['code','name'],actions:['name'],parties:['code','name'],interviews:['name'],evidence:['code','name']};
const req=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`--${k} is required`);return o[k].trim();};
const date=(s)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error(`Invalid calendar date: ${s}`);return s;};
const futureReview=(s)=>{date(s);if(s<=new Date().toISOString().slice(0,10))throw Error('Review date must be after today');return s;};
const stamp=(s)=>{if(!/T.*(?:Z|[+-]\d\d:\d\d)$/.test(s)||!Number.isFinite(Date.parse(s)))throw Error('Timestamp needs a date, time and timezone');return new Date(s).toISOString();};
async function find(db,kind,ref){
 if(!kinds[kind])throw Error('Kind must be cases, actions, parties, interviews or evidence');if(!ref?.trim())throw Error('--ref is required');
 const rows=await db.query(`select * from ${kind} order by id`);const key=ref.toLowerCase();
 const exact=rows.filter(r=>r.id===ref||kinds[kind].some(k=>String(r[k]).toLowerCase()===key));
 const hits=exact.length?exact:rows.filter(r=>r.id.startsWith(key)||kinds[kind].some(k=>String(r[k]).toLowerCase().includes(key)));
 if(hits.length!==1)throw Error(hits.length?`Ambiguous ${kind}:\n${hits.map(r=>`${r.id} ${r.code||''} ${r.name}`).join('\n')}`:`No ${kind} matches ${ref}`);return hits[0];
}
async function active(db,id){const [c]=await db.query('select * from cases where id=$1 for update',[id]);if(!c)throw Error('Case missing');if(c.status==='closed')throw Error('Case is closed; reopen with a reason first');return c;}
async function audit(db,caseId,cmd,actor,detail){await db.query('insert into activity(case_id,operation,actor,detail) values($1,$2,$3,$4)',[caseId,cmd,actor,detail]);}
function privateWrite(file,body){fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,body,{flag:'wx',mode:0o600});return file;}
const safeOutput=(dir,name)=>path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,dir,name);
export function formatRows(rows){return table(rows,Object.keys(rows[0]||{}).map(key=>({key,label:key,width:70,format:v=>typeof v==='object'&&v!==null?JSON.stringify(v):v})));}

export async function run(db,cmd,o={},pos=[]){
 if(!(cmd in specs))throw Error(`Unknown command: ${cmd}. Use help.`);
 for(const key of Object.keys(o))if(key!=='json'&&!specs[cmd].includes(key))throw Error(`--${key} is not valid for ${cmd}`);
 if(o.json!==undefined&&o.json!==true)throw Error('--json is a switch');
 if(o['dry-run']!==undefined&&o['dry-run']!==true)throw Error('--dry-run is a switch');
 if(cmd!=='import'&&pos.length)throw Error('Unexpected positional arguments');
 if(cmd==='help')return commands.map(command=>({command,options:specs[command].map(x=>'--'+x).join(' ')}));
 if(cmd==='list'){if(o.status&&!['open','closed'].includes(o.status))throw Error('Invalid status');return db.query('select id,code,name,owner,status,priority,due_on from cases where ($1::text is null or status=$1) order by code',[o.status||null]);}
 if(cmd==='show')return [await find(db,o.kind||'cases',req(o,'ref'))];
 if(reports[cmd])return db.query(reports[cmd]);
 if(cmd==='chronology'){
  const c=await find(db,'cases',req(o,'ref'));
  return db.query(`select created_at as at,'note' as kind,name as event,body as detail,actor from notes where case_id=$1
  union all select created_at,operation,operation,detail,actor from activity where case_id=$1 order by at,event`,[c.id]);
 }
 if(cmd==='compliance')return db.query(`
 select code as record,'IPP9' as rule,'Record purpose and a future retention review; no automatic deletion' as issue from cases where purpose='' or review_on is null or review_on<=current_date
 union all select code,'IPP5','Assign a responsible owner' from cases where owner=''
 union all select e.code,'CUSTODY','Record current custody or review the evidence' from evidence e where e.review_on<=current_date or not exists(select 1 from custody h where h.evidence_id=e.id and h.sequence=(select max(x.sequence) from custody x where x.evidence_id=e.id) and h.to_holder=e.holder and h.location=e.location)
 union all select code,'HOLD','Preserved under recorded hold; review with responsible person' from cases where legal_hold order by record,rule`);
 if(cmd==='weekly-review'){
  const out=[];for(const section of ['attention','actions-due','interviews-due','custody-review','retention-review'])for(const r of await run(db,section))out.push({section,record:r.case_code||r.code,summary:r.needs||r.name||r.purpose||'',due:r.due_on||r.scheduled_at||r.review_on||''});return out;
 }
 if(cmd==='export'){
  await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try{const records={};for(const t of [...Object.keys(kinds),'case_parties','custody','notes','activity'])records[t]=await db.query(`select * from ${t} order by id`);
   const file=path.resolve(o.out||safeOutput('exports',`investigations-${randomUUID()}.json`));privateWrite(file,JSON.stringify({format:'investigations-v1',exported_at:new Date().toISOString(),records},null,2)+'\n');return [{file,records:Object.values(records).reduce((n,r)=>n+r.length,0)}];
  }finally{await db.exec('ROLLBACK');}
 }
 if(cmd==='draft-brief'){
  const c=await find(db,'cases',req(o,'ref'));const chronology=await run(db,'chronology',{ref:c.id});const acts=await db.query('select name,owner,due_on,status,result from actions where case_id=$1 order by due_on',[c.id]);
  const file=path.resolve(o.out||safeOutput('drafts',`brief-${c.code.replace(/[^a-z0-9-]/gi,'_')}-${randomUUID()}.md`));
  privateWrite(file,`# DRAFT: ${c.code}: ${c.name}\n\nPurpose: ${c.purpose||'Not recorded'}\nOwner: ${c.owner||'Unassigned'}\nStatus: ${c.status}\n\n## Recorded chronology\n\n${formatRows(chronology)}\n\n## Actions\n\n${formatRows(acts)}\n\n## Operator conclusion\n\n${c.conclusion||'No conclusion recorded. Human review required.'}\n\nPrivate working document. No allegation is established by appearing in this record.\n`);return [{file}];
 }
 const actor=req(o,'actor');
 await db.exec('BEGIN');
 try{
  let rows,caseId=null,detail='';
  if(cmd==='import'){rows=await importSalesforce(db,o,pos);detail=JSON.stringify(rows[0]);}
  else if(cmd==='add-case'){
   rows=await db.query('insert into cases(code,name,owner,purpose,due_on,review_on,priority) values($1,$2,$3,$4,$5,$6,$7) returning *',[req(o,'code'),req(o,'name'),req(o,'owner'),req(o,'purpose'),date(req(o,'due')),futureReview(req(o,'review')),o.priority||'normal']);caseId=rows[0].id;detail=rows[0].code;
  }else if(cmd==='add-party'){
   rows=await db.query('insert into parties(code,name) values($1,$2) returning *',[req(o,'code'),req(o,'name')]);detail=rows[0].code;
  }else if(['review-case','add-action','link-party','add-interview','add-evidence','log','close-case','reopen-case'].includes(cmd)){
   let c=await find(db,'cases',req(o,'ref'));caseId=c.id;
   if(cmd!=='reopen-case')c=await active(db,c.id);
   if(cmd==='review-case'){
    if(o.hold!==undefined&&!['true','false'].includes(o.hold))throw Error('--hold must be true or false');
    const hold=o.hold===undefined?c.legal_hold:o.hold==='true';const reason=o.hold===undefined?c.hold_reason:req(o,'reason');
    rows=await db.query('update cases set owner=$2,purpose=$3,due_on=$4,review_on=$5,priority=$6,legal_hold=$7,hold_reason=$8,reviewed_by=$9,reviewed_at=now() where id=$1 returning *',[c.id,req(o,'owner'),req(o,'purpose'),date(req(o,'due')),futureReview(req(o,'review')),o.priority||c.priority,hold,reason,actor]);detail=`Review recorded; hold=${hold}; ${reason}`;
   }else if(cmd==='add-action')rows=await db.query('insert into actions(case_id,name,owner,due_on) values($1,$2,$3,$4) returning *',[c.id,req(o,'name'),req(o,'owner'),date(req(o,'due'))]);
   else if(cmd==='link-party'){
    const p=await find(db,'parties',req(o,'party'));rows=await db.query('insert into case_parties(case_id,party_id,role,basis) values($1,$2,$3,$4) returning *',[c.id,p.id,req(o,'role'),req(o,'basis')]);
   }else if(cmd==='add-interview'){
    const p=await find(db,'parties',req(o,'party'));const linked=await db.query('select id from case_parties where case_id=$1 and party_id=$2',[c.id,p.id]);if(!linked.length)throw Error('Link the party to this case first');
    rows=await db.query('insert into interviews(case_id,party_id,name,owner,scheduled_at) values($1,$2,$3,$4,$5) returning *',[c.id,p.id,req(o,'name'),req(o,'owner'),stamp(req(o,'at'))]);
   }else if(cmd==='add-evidence'){
    const hash=createHash('sha256').update(fs.readFileSync(path.resolve(req(o,'file')))).digest('hex');
    rows=await db.query('insert into evidence(case_id,code,name,holder,location,sha256,basis,review_on) values($1,$2,$3,$4,$5,$6,$7,$8) returning *',[c.id,req(o,'code'),req(o,'name'),req(o,'holder'),req(o,'location'),hash,req(o,'basis'),futureReview(req(o,'review'))]);
    await db.query('insert into custody(evidence_id,sequence,from_holder,to_holder,location,reason,actor) values($1,1,$2,$3,$4,$5,$6)',[rows[0].id,'',rows[0].holder,rows[0].location,'Receipt: '+req(o,'basis'),actor]);
   }else if(cmd==='log')rows=await db.query('insert into notes(case_id,name,body,actor) values($1,$2,$3,$4) returning *',[c.id,req(o,'name'),req(o,'note'),actor]);
   else if(cmd==='close-case'){
    if(!c.owner||!c.purpose||!c.reviewed_at||!c.review_on||c.review_on<=new Date().toISOString().slice(0,10))throw Error('Complete the case review before closure');
    const [pending]=await db.query("select (select count(*) from actions where case_id=$1 and status='open')+(select count(*) from interviews where case_id=$1 and status='scheduled')+(select count(*) from evidence where case_id=$1 and disposition='held') as n",[c.id]);if(Number(pending.n)>0)throw Error('Resolve open actions, interviews and evidence dispositions before closure');
    rows=await db.query("update cases set status='closed',conclusion=$2,closed_at=now() where id=$1 returning *",[c.id,req(o,'conclusion')]);detail=req(o,'conclusion');
   }else if(cmd==='reopen-case'){
    [c]=await db.query('select * from cases where id=$1 for update',[c.id]);if(c.status!=='closed')throw Error('Case is not closed');
    detail=req(o,'reason');rows=await db.query("update cases set status='open',closed_at=null,reviewed_at=null where id=$1 returning *",[c.id]);
   }
  }else{
   const kind=cmd==='complete-action'?'actions':cmd==='record-interview'?'interviews':'evidence';
   const item=await find(db,kind,req(o,'ref'));caseId=item.case_id;const c=await active(db,caseId);
   const [current]=await db.query(`select * from ${kind} where id=$1 for update`,[item.id]);
   if(cmd==='complete-action'){
    if(current.status==='done')throw Error('Action is already done');rows=await db.query("update actions set status='done',result=$2 where id=$1 returning *",[item.id,req(o,'result')]);
   }else if(cmd==='record-interview'){
    if(current.status!=='scheduled')throw Error('Interview already recorded');const status=req(o,'status');if(!['held','cancelled'].includes(status))throw Error('Status must be held or cancelled');
    if(status==='held'&&new Date(current.scheduled_at)>new Date())throw Error('Cannot record a future interview as held');
    rows=await db.query('update interviews set status=$2,notes=$3 where id=$1 returning *',[item.id,status,req(o,'note')]);
   }else if(cmd==='transfer-evidence'||cmd==='return-evidence'){
    if(cmd==='return-evidence'&&c.legal_hold)throw Error('Case is on legal hold; cannot return evidence');
    if(current.disposition==='returned')throw Error('Evidence already returned');if(current.holder!==req(o,'from'))throw Error('Current holder differs from --from');
    const to=req(o,'to');const location=req(o,'location');detail=req(o,'reason');
    const [n]=await db.query('select coalesce(max(sequence),0)+1 as seq from custody where evidence_id=$1',[item.id]);
    await db.query('insert into custody(evidence_id,sequence,from_holder,to_holder,location,reason,actor) values($1,$2,$3,$4,$5,$6,$7)',[item.id,n.seq,current.holder,to,location,detail,actor]);
    rows=await db.query('update evidence set holder=$2,location=$3,disposition=$4,disposition_reason=$5 where id=$1 returning *',[item.id,to,location,cmd==='return-evidence'?'returned':current.disposition,cmd==='return-evidence'?detail:current.disposition_reason]);
   }else if(cmd==='review-evidence'){
    const disposition=req(o,'disposition');if(!['held','retained','returned'].includes(disposition))throw Error('Invalid disposition');
    if(current.disposition==='returned'&&disposition!=='returned')throw Error('Returned evidence cannot be reinstated without a new receipt');
    if(c.legal_hold&&disposition==='returned')throw Error('Case is on legal hold; cannot return evidence');
    if(disposition==='returned'&&current.disposition!=='returned')throw Error('Use return-evidence to record the recipient and physical handover');
    rows=await db.query('update evidence set disposition=$2,disposition_reason=$3,review_on=$4 where id=$1 returning *',[item.id,disposition,req(o,'reason'),futureReview(req(o,'review'))]);
   }
  }
  await audit(db,caseId,cmd,actor,JSON.stringify({detail,after:rows}));
  await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return rows;
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
async function importSalesforce(db,o,pos){
 if(pos.length!==1||!['salesforce','salesforce-investigative-case-management'].includes(pos[0]))throw Error('Use import salesforce --dir=<export-folder>');
 if(Boolean(o.dir)===Boolean(o.file))throw Error('Choose exactly one --dir or --file (Case.csv)');
 const files=o.file?[['cases',path.resolve(o.file)]]:[['cases',path.resolve(o.dir,'Case.csv')],['actions',path.resolve(o.dir,'Task.csv')]];
 if(!fs.existsSync(files[0][1]))throw Error('Case.csv is required');
 let inserted=0,unchanged=0;const sourceCases=new Set();
 for(const [kind,file] of files){
  if(!fs.existsSync(file))continue;const rows=parseCsv(fs.readFileSync(file,'utf8'));if(!rows.length)throw Error('Import file has no records: '+file);
  const seen=new Set();
  for(const r of rows){
   const source=pick(r,'Id');if(!source)throw Error('Every row requires Id');if(seen.has(source))throw Error('Duplicate source Id: '+source);seen.add(source);
   if(kind==='cases')sourceCases.add(source);
   const [existing]=await db.query(`select * from ${kind} where source_id=$1`,[source]);
   if(existing){if(!isDeepStrictEqual(existing.source_data,r))throw Error(`Changed source ${source}; reconcile explicitly before importing. Nothing has been changed.`);unchanged++;continue;}
   const name=pick(r,'Subject');if(!name.trim())throw Error('Subject is required: '+source);
   if(kind==='cases'){
    const code='SF-'+(pick(r,'CaseNumber')||source);
    await db.query('insert into cases(code,name,source_id,source_data) values($1,$2,$3,$4)',[code,name,source,JSON.stringify(r)]);
   }else{
    const what=pick(r,'WhatId');const [c]=await db.query('select * from cases where source_id=$1',[what]);if(!c||!sourceCases.has(what))throw Error('Task WhatId must refer to a case in this Case.csv: '+source);
    await active(db,c.id);const due=pick(r,'ActivityDate');if(due)date(due);
    await db.query('insert into actions(case_id,name,due_on,source_id,source_data) values($1,$2,$3,$4,$5)',[c.id,name,due||null,source,JSON.stringify(r)]);
   }
   inserted++;
  }
 }
 return [{inserted,unchanged,dry_run:Boolean(o['dry-run']),review:'Imported case and task statuses remain open pending operator review. Original fields preserved.'}];
}
export function parseArgs(args){const o={},pos=[];for(let i=0;i<args.length;i++){const a=args[i];if(!a.startsWith('--')){pos.push(a);continue;}const equal=a.indexOf('=');const k=a.slice(2,equal<0?undefined:equal);if(Object.hasOwn(o,k))throw Error('Repeated flag --'+k);o[k]=equal>=0?a.slice(equal+1):['json','dry-run'].includes(k)?true:args[i+1]&&!args[i+1].startsWith('--')?args[++i]:true;}return {o,pos};}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{const cmd=process.argv[2]||'help';const {o,pos}=parseArgs(process.argv.slice(3));db=await getDb();const rows=await run(db,cmd,o,pos);console.log(o.json?JSON.stringify(rows,null,2):formatRows(rows));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
