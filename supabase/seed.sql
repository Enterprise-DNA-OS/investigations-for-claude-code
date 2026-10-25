insert into cases(id,code,name,owner,priority,purpose,due_on,review_on,legal_hold,hold_reason,created_at) values
('10000000-0000-4000-8000-000000000001','INV-101','Missing delivery records','Aroha','high','Establish the documented delivery sequence',current_date-2,current_date+30,false,'',now()-interval '20 days'),
('10000000-0000-4000-8000-000000000002','INV-102','Supplier document discrepancy','','normal','Review conflicting supplier documents',current_date+5,current_date-1,true,'Preservation instruction DEMO-HOLD-2',now()-interval '35 days'),
('10000000-0000-4000-8000-000000000003','INV-103','Stock access review','Tui','normal','Check recorded access to storage',current_date+12,current_date+60,false,'',now()-interval '15 days') on conflict do nothing;
insert into parties(id,code,name) values ('20000000-0000-4000-8000-000000000001','P-101','Kauri Logistics contact'),('20000000-0000-4000-8000-000000000002','P-102','Harbour Supplies contact') on conflict do nothing;
insert into case_parties(case_id,party_id,role,basis) values
('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','witness','Listed on fictional delivery record'),
('10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','witness','Listed on fictional supplier record') on conflict do nothing;
insert into actions(id,case_id,name,owner,due_on) values
('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Reconcile delivery timestamps','Aroha',current_date-3),
('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Confirm supplier version','',current_date+2),
('30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','Check access register','Tui',current_date+5) on conflict do nothing;
insert into interviews(id,case_id,party_id,name,owner,scheduled_at) values
('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Delivery chronology interview','Aroha',now()-interval '1 day') on conflict do nothing;
insert into evidence(id,case_id,code,name,holder,location,sha256,basis,review_on) values
('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','EV-101','Delivery manifest copy','Aroha','Fictional cabinet A',repeat('a',64),'Demo record, no actual file',current_date-1),
('50000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','EV-102','Supplier statement copy','Tui','Fictional cabinet B',repeat('b',64),'Demo record, no actual file',current_date+14) on conflict do nothing;
insert into custody(evidence_id,sequence,from_holder,to_holder,location,reason,actor) values
('50000000-0000-4000-8000-000000000001',1,'','Aroha','Fictional cabinet A','Fictional receipt','Demo operator'),
('50000000-0000-4000-8000-000000000002',1,'','Tui','Fictional cabinet B','Fictional receipt','Demo operator') on conflict do nothing;
insert into notes(id,case_id,name,body,actor,created_at) values ('60000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Initial brief','Compare the recorded timestamps before drawing any conclusion. All data is fictional.','Demo operator',now()-interval '12 days') on conflict do nothing;
