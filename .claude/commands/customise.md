# customise

Read CLAUDE.md and the current schema. Ask which field, stage or review rule the operator wants changed if it is unclear. Propose the precise change and its effect on existing records.

Add a new numbered migration; never rewrite an applied migration. Back up first with the export command. Add validation and a meaningful smoke assertion for the changed rule, update the CLI and its existing recipe, run npm test on an isolated database, then apply the migration to the requested database. Do not assume a shared database is a demo.

Keep existing identifiers, custody events and source fields. Never loosen a preservation hold or invent a legal deadline. Report the migration and verification result.
