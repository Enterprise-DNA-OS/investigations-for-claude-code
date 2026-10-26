# Investigations for Claude Code

Own your casework records: evidence receipts, interviews, next actions, custody handovers and the review before closure.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free, MIT. Install the working base. | Your case types, review rules, documents and Salesforce records. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |

[Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=salesforce-investigative-case-management) · [Instead of Salesforce Investigative Case Management](https://enterprisedna.co/omni/instead-of/salesforce-investigative-case-management?utm_source=github&utm_medium=readme&utm_campaign=salesforce-investigative-case-management)

## Start with a working case desk

Node 20 or later. Open the folder in Claude Code, Codex, OpenCode or Cursor. All four use CLAUDE.md and the same command recipes.

```bash
npm install
npm run demo
npm run investigations -- weekly-review
npm run docs
npm run view
```

PGlite runs locally without a database server. DATA_DIR selects a local data directory. DATABASE_URL selects PostgreSQL for a trusted operator. Keep the demo separate from real records. The Kauri Investigation Desk seed is entirely fictional and includes an overdue action, an unassigned case, a missed interview and an evidence review due. Seed is repeat-safe and preserves your existing work.

## The weekly rituals

1. Case conference: /weekly-review joins attention, actions, interviews, custody and retention.
2. Intake: /add-case, /review-case, /add-party and /link-party record the brief and the reason for each association.
3. Evidence receipt: /add-evidence computes the supplied file's SHA-256 and records its holder, location and purpose. /transfer-evidence records each actual handover.
4. Interviews: /add-interview schedules one for a linked party; /record-interview records the operator's account after it happened.
5. Case review: /complete-action, /review-evidence and /close-case record outcomes. Open actions, scheduled interviews and unreviewed evidence dispositions block closure.
6. Retention: /retention-review and /compliance flag records needing a decision. A recorded legal hold blocks /return-evidence. Nothing is automatically erased.

31 CLI commands and 33 slash-command recipes. All CLI commands support --json. Exact codes, case-insensitive names and partial UUIDs work. Ambiguous references list candidates and exit 1. Writes require --actor.

## Ten questions this build answers

These are tested queries over the records. They are not claims that Salesforce cannot answer the same questions.

1. Which open cases lack an owner or a recent intake review? /attention.
2. Which assigned actions are overdue or due within a week? /actions-due.
3. Which interviews were scheduled but have no recorded outcome? /interviews-due.
4. Which evidence checks are overdue or missing a custody receipt? /custody-review.
5. Which cases are due for a retention decision and carry a hold? /retention-review.
6. Which parties appear in more than one case? /party-links.
7. How many open actions and held items sit on each case? /case-load.
8. What was recorded before a case was closed or reopened? /chronology.
9. Which records lack purpose, ownership or custody review evidence? /compliance.
10. Which actions, interviews and evidence reviews belong on Monday's agenda? /weekly-review.

## Bring your Salesforce records

```bash
npm run investigations -- import salesforce --dir=tests/fixtures/salesforce --dry-run --actor="Your name"
npm run investigations -- import salesforce --dir=tests/fixtures/salesforce --actor="Your name"
```

Replace the example directory with your scoped export containing Case.csv and optional Task.csv. Imports preserve original columns and link tasks through WhatId. Repeating an identical export changes nothing. A bad linked row rolls back the complete import. A changed export stops for explicit reconciliation. All imported cases and tasks enter an open review queue; source status, ownership and custom fields remain preserved for mapping.

[The replace guide](docs/replace-salesforce-investigative-case-management.md) names what maps and what needs further work. Interviews, parties, custody items, files, permissions and custom investigative objects require separate mapping. Do not interpret imported cases as a complete investigation archive or switch off the source system before reconciliation.

## Paperwork and private reports

Set brand.json to your business name, colours and logo. npm run docs writes a case brief per case and a custody register per evidence item under docs-out/. npm run view writes the week's work, custody review and cross-case links under views/. The reports are read-only HTML. /draft-brief writes a private working brief under drafts/ and never sends it.

A file hash identifies bytes at receipt. It does not establish authorship, truth, physical custody or admissibility. Custody is an operator record, and a database administrator can alter it. This base is not a forensic evidence vault, digital signature service, live surveillance tool or court filing system. Case links are recorded associations, never conclusions. [Compliance checks and deployment duties](docs/compliance.md).

## Your first hour: ten things to ask for

1. Put our business name on the case brief.
2. Test an import of our case export.
3. Map our case-owner identifiers to people.
4. Add our case categories.
5. Record the review date required by our retention policy.
6. Show actions due before the next case conference.
7. Add a receipt reference to evidence handovers.
8. Group open work by investigator.
9. Add a recorded approval field for case closure.
10. Draft a brief from one case's actual history.

/customise adds a migration and verification for the requested change. /new-view adds a private read-only report. [What a front end adds](docs/why-no-front-end.md).

## Verification

npm test creates an isolated temporary database, applies migrations twice, seeds twice, exercises every CLI command, checks failed-import rollback, repeat imports, closure gates, preservation holds, interview timing, real file hashing, custody sequencing, escaped HTML and CLI exit codes. A workflow tests Linux and Windows with Node 20 and 22, plus PostgreSQL 17. Check its result before claiming those environments passed. TEST_DATABASE_URL must identify an empty disposable database.

## Price and scope

Salesforce publishes Public Sector Service Core at US$275 per user per month, billed annually. Ten users produce a US$33,000 annual platform-price scenario. This is not a standalone app quote or an observed customer invoice. Confirm the investigative app configuration and any other charges with Salesforce. [Vendor pricing](https://www.salesforce.com/government/solutions/pricing/), checked 25 October 2026. [Selection and sources](docs/research.md).

Enterprise DNA builds the agreed version around your casework, maps your records and adds team access, evidence storage and connected services when required. Omni by Enterprise DNA operates it for one setup fee, then a retainer. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_medium=readme).

MIT. Not affiliated with Salesforce or Anthropic. Hosting and coding-agent usage have their own costs.
