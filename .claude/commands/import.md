# import

Bring Case.csv and optional Task.csv from a scoped Salesforce export into a review queue. Read the replace guide first.

Read CLAUDE.md. Read the current case and chronology first. Use only facts and the actor name supplied by the operator. Confirm ambiguous references by listing the candidates.

```bash
npm run investigations -- import salesforce --dir="tests/fixtures/salesforce" --dry-run --actor="Operator"
```

The example dates, names and record IDs are placeholders. Replace them with the actual instruction. Do not silently use the example dates or invent findings.

Accepted options: `--dir`, `--file`, `--dry-run`, `--actor`. Add `--json` for structured output. Run the test import first, inspect counts and original fields, then repeat without --dry-run only within the operator's migration instruction. Changed exports stop instead of overwriting local work.



Read the affected record again and report what was saved. Never send, publish, decide liability or delete evidence.
