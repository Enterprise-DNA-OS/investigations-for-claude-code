# Investigations for Claude Code

A single-business investigation desk for an authorised caseworker. Fictional data is supplied for practice. The database records facts the operator provides, relationships, actions, custody and reviews. It does not establish guilt, liability, legal admissibility or investigation powers.

## Start here

Read README.md and docs/compliance.md. Every answer starts with the CLI. Read the case and chronology before writing. Use the operator's own name for --actor; never impersonate an approver. No external sends, publication, automatic deletion or live customer connections.

## Routing

| Job | Recipe |
|---|---|
| help | /help |
| list | /list |
| show | /show |
| Review the open caseload, assigned people, deadlines and held evidence. | /case-load |
| Review overdue actions, undated actions and actions due within seven days. | /actions-due |
| Review scheduled interviews through the coming seven days, including missed interviews. | /interviews-due |
| Review overdue evidence checks and missing custody receipts. | /custody-review |
| Review case retention dates and preservation holds. Never delete on the strength of a date alone. | /retention-review |
| Show parties recorded in more than one case. A shared party is a lead to review, not proof of wrongdoing. | /party-links |
| Review unassigned, overdue and unreviewed cases. The fourteen-day quiet-case check is an internal working rule. | /attention |
| chronology | /chronology |
| Review privacy-purpose, ownership, retention and custody checks. Read docs/compliance.md for sources and limits. | /compliance |
| Run the weekly case conference. The CLI combines attention, actions due, interviews due, custody review and retention review. | /weekly-review |
| add case | /add-case |
| review case | /review-case |
| add action | /add-action |
| complete action | /complete-action |
| add party | /add-party |
| link party | /link-party |
| add interview | /add-interview |
| record interview | /record-interview |
| add evidence | /add-evidence |
| transfer evidence | /transfer-evidence |
| Record a real physical return with recipient, destination and receipt. Legal holds block this command. | /return-evidence |
| review evidence | /review-evidence |
| log | /log |
| Record a human closure decision after all actions, interviews and evidence dispositions are reviewed. | /close-case |
| reopen case | /reopen-case |
| Bring Case.csv and optional Task.csv from a scoped Salesforce export into a review queue. Read the replace guide first. | /import |
| export | /export |
| draft brief | /draft-brief |
| Change a field or rule | /customise |
| Add a read-only report | /new-view |

## Working rules

Use npm run investigations -- help for arguments. Every command accepts --json. Use exact codes, case-insensitive names or partial UUIDs. An ambiguous reference lists candidates and exits 1. Never guess. Mutations require --actor and run in one transaction.

Imported cases and actions stay open for review, including source records marked closed. Original fields remain in source_data. Configure ownership, purpose and review dates before closing a case. A missing record is unknown, not a pass. Never invent testimony, receipt times, reasons for a hold or conclusions. Record interviews only after they occurred.

Preservation holds block evidence returns. Closing a case does not delete or release evidence and does not lift a hold. Closed cases must be reopened with a reason before more casework. No deletion command exists. Return records require the actual recipient, destination and a receipt reference in the reason.

## Files and access

One CLI: scripts/investigations.mjs. Migrations: supabase/migrations. Recurring recipes: .claude/commands. All coding agents use these same files. Read-only reports come from views.json and documents.json, branded by brand.json. Drafts, reports, exports, imports and the local database are excluded from git.

The local filesystem and a trusted database operator are the access boundary. Database tables use row-level security with no public policies. This is not per-user authentication. The deployment operator must configure accounts, backups, encrypted storage, access review and recovery before team use. Never seed a shared database.

Omni by Enterprise DNA installs, customises and runs the agreed system: https://enterprisedna.co/omni/book/?offer=replace-software&utm_medium=repo
