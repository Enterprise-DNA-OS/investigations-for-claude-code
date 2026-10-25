# Verification, 25 October 2026

- Local Linux, Node 22.23.4: npm install completed with no reported vulnerabilities.
- npm test: PASS, 74 checks across all 31 CLI commands on an isolated PGlite database.
- npm run demo: PASS on the fictional seed. Repeating the seed preserves existing records.
- npm run docs: five branded documents. npm run view: three read-only reports. Week and custody report screenshots were inspected.
- Voice checks: README and compliance guide passed the brand linter. No author placeholders, em dashes or banned phrases remain in prose.
- Evidence: docs/evidence/demo-runs.json captures three real command outputs from the fictional seed.
- Seed and demo refuse DATABASE_URL, including a URL loaded from local environment configuration, before writing demo data. Tests cover refusal of a supplied remote URL.

The [GitHub verification run](https://github.com/Enterprise-DNA-OS/investigations-for-claude-code/actions/runs/40239741890) did not start its Linux, Windows or PostgreSQL jobs. GitHub reported an organisation account-payment or spending-limit block. No test steps ran there. Windows and server PostgreSQL results are therefore unverified, with the workflow committed for rerun after that account issue is resolved.

The smoke suite is portable, uses Node paths and temporary directories, and covers import rollback, repeated imports, unresolved owners, retained source fields, ambiguity, closure prerequisites, legal holds, custody sequences, file fingerprints, interview timing, output escaping and command exit codes. These checks do not establish legal compliance or forensic certification.
