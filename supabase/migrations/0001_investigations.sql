create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table cases (
 id uuid primary key default gen_random_uuid(), code text not null unique check(length(trim(code))>0), name text not null check(length(trim(name))>0),
 owner text not null default '', status text not null default 'open' check(status in ('open','closed')),
 priority text not null default 'normal' check(priority in ('low','normal','high','urgent')),
 purpose text not null default '', due_on date, review_on date, legal_hold boolean not null default false, hold_reason text not null default '',
 conclusion text not null default '', reviewed_by text not null default '', reviewed_at timestamptz, closed_at timestamptz,
 source_id text unique, source_data jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(not legal_hold or length(trim(hold_reason))>0), check(status <> 'closed' or (closed_at is not null and length(trim(conclusion))>0))
);
create table actions (
 id uuid primary key default gen_random_uuid(), case_id uuid not null references cases(id), name text not null check(length(trim(name))>0), owner text not null default '', due_on date,
 status text not null default 'open' check(status in ('open','done')), result text not null default '', source_id text unique, source_data jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(status<>'done' or length(trim(result))>0)
);
create table parties (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null check(length(trim(name))>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table case_parties (
 id uuid primary key default gen_random_uuid(), case_id uuid not null references cases(id), party_id uuid not null references parties(id), role text not null check(role in ('witness','reporter','subject','adviser','other')),
 basis text not null check(length(trim(basis))>0), unique(case_id,party_id,role), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table interviews (
 id uuid primary key default gen_random_uuid(), case_id uuid not null references cases(id), party_id uuid not null references parties(id), name text not null,
 scheduled_at timestamptz not null, owner text not null, status text not null default 'scheduled' check(status in ('scheduled','held','cancelled')), notes text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(status='scheduled' or length(trim(notes))>0)
);
create table evidence (
 id uuid primary key default gen_random_uuid(), case_id uuid not null references cases(id), code text not null unique, name text not null,
 holder text not null check(length(trim(holder))>0), location text not null check(length(trim(location))>0), sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
 basis text not null check(length(trim(basis))>0), review_on date not null, disposition text not null default 'held' check(disposition in ('held','retained','returned')),
 disposition_reason text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(disposition='held' or length(trim(disposition_reason))>0)
);
create table custody (
 id uuid primary key default gen_random_uuid(), evidence_id uuid not null references evidence(id), sequence integer not null check(sequence>0),
 from_holder text not null, to_holder text not null, location text not null, reason text not null, actor text not null, unique(evidence_id,sequence),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table notes (
 id uuid primary key default gen_random_uuid(), case_id uuid not null references cases(id), name text not null, body text not null, actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table activity (
 id uuid primary key default gen_random_uuid(), case_id uuid references cases(id), operation text not null, actor text not null, detail text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
do $$ declare t text; begin foreach t in array array['cases','actions','parties','case_parties','interviews','evidence','custody','notes','activity'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',t);
 execute format('alter table %I enable row level security',t); execute format('revoke all on %I from public',t);
end loop; end $$;
create index actions_case on actions(case_id); create index evidence_case on evidence(case_id); create index interviews_case on interviews(case_id);
create view v_actions_due as select a.id,c.code as case_code,a.name,a.owner,a.due_on,(current_date-a.due_on) as overdue_days
 from actions a join cases c on c.id=a.case_id where a.status='open' and c.status='open' and (a.due_on is null or a.due_on<=current_date+7);
create view v_case_load as select c.code,c.name,c.owner,c.priority,c.due_on,
 (select count(*)::int from actions a where a.case_id=c.id and a.status='open') as open_actions,
 (select count(*)::int from evidence e where e.case_id=c.id and e.disposition='held') as held_items
 from cases c where c.status='open';
create view v_custody_review as select e.id,c.code as case_code,e.code,e.name,e.holder,e.location,e.review_on,e.disposition,
 (select count(*)::int from custody h where h.evidence_id=e.id) as custody_events
 from evidence e join cases c on c.id=e.case_id where e.review_on<=current_date or not exists(select 1 from custody h where h.evidence_id=e.id);
create view v_retention_review as select code,name,status,review_on,legal_hold,hold_reason,purpose from cases where review_on is null or review_on<=current_date;
create view v_interviews_due as select i.id,c.code as case_code,p.name as party,i.name,i.owner,i.scheduled_at from interviews i join cases c on c.id=i.case_id join parties p on p.id=i.party_id where i.status='scheduled' and i.scheduled_at<=now()+interval '7 days';
create view v_party_links as select p.code,p.name,count(distinct cp.case_id)::int as cases,string_agg(distinct c.code,', ' order by c.code) as case_codes from parties p join case_parties cp on cp.party_id=p.id join cases c on c.id=cp.case_id group by p.id;
revoke all on v_actions_due,v_case_load,v_custody_review,v_retention_review,v_interviews_due,v_party_links from public;
