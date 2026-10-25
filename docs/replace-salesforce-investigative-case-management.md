# Move investigation records from Salesforce

## Prepare the export

Salesforce's [Data Export](https://help.salesforce.com/s/articleView?id=sf.admin_exportdata.htm&language=en_US) provides CSV exports. Its [Data Loader](https://help.salesforce.com/s/articleView?id=exporting_data.htm&language=en_US&type=5) exports selected objects. [Details-only reports](https://trailhead.salesforce.com/content/learn/projects/create-reports-and-dashboards-for-sales-and-marketing-managers/manage-reported-data) also export CSV. Use an authorised administrator and export only the casework you intend to migrate.

Extract Case.csv and Task.csv into a private directory. Use UTF-8 and API field headings. For report exports, rename the headings to the fields below. Filter tasks to WhatId values in your Case.csv. Keep the full original export separately under your retention controls.

## Test, then import

```bash
npm run investigations -- import salesforce --dir="imports/salesforce" --dry-run --actor="Your name"
npm run investigations -- import salesforce --dir="imports/salesforce" --actor="Your name"
```

A case-only export also works with --file="imports/Case.csv". The whole batch is transactional. Missing links, duplicate IDs, malformed CSV and changed source records stop the batch. Identical repeats are unchanged. No live Salesforce connection is required.

## Mapping

| Source | Local field | Treatment |
|---|---|---|
| Case.Id | source_id | Stable identity for repeat imports |
| Case.CaseNumber | code | Prefixed SF-, falling back to Id |
| Case.Subject | name | Required |
| Task.Id | source_id | Stable task identity |
| Task.WhatId | case_id | Must point to a case in this export |
| Task.Subject | name | Required |
| Task.ActivityDate | due_on | Calendar date or unknown |
| All original columns | source_data | Preserved, including Status, OwnerId, Description, timestamps and custom fields |

Source status and ownership are not treated as a reviewed local decision. Every imported case and task stays open. Use /review-case to map the owner, purpose, due date and retention review, and /complete-action to record verified source outcomes. The source closed state is retained for reconciliation. This prevents a migration from silently bypassing closure checks.

## Separate migration work

Salesforce [Investigative Case Management](https://developer.salesforce.com/docs/platform/data-models/guide/justice-investigative-case-management.html) includes related parties, custody items, evidence, assessments, proceedings and other relationships. This importer does not claim to import those objects. Map them with the supplied casework commands or add a reviewed importer through /customise. Files and attachments remain in their controlled source storage until copied and reconciled. The evidence receipt command hashes a supplied local file but does not copy it into a vault.

Permissions, flows, portals, digital signatures, legal forms, retention schedules and source audit logs do not automatically carry across. Enterprise DNA scopes these in a custom migration.

## Reconcile before switching

Compare case and task counts, source identifiers and original fields. Review closed-source records, owners, relationships and every evidence receipt. Compare the case brief and custody register to the source. Keep Salesforce available until the case owner approves the full migrated scope, access controls and recovery test. A one-command record import is not proof that every part of an investigative deployment has moved.
