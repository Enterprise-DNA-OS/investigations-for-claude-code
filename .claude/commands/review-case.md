# review-case

Use the investigation records to review case.

Read CLAUDE.md. Read the current case and chronology first. Use only facts and the actor name supplied by the operator. Confirm ambiguous references by listing the candidates.

```bash
npm run investigations -- review-case --ref="INV-101" --owner="Operator" --purpose="Reconcile supplied receipts" --due="2099-01-01" --review="2099-02-01" --actor="Operator"
```

The example dates, names and record IDs are placeholders. Replace them with the actual instruction. Do not silently use the example dates or invent findings.

Accepted options: `--ref`, `--owner`, `--purpose`, `--due`, `--review`, `--priority`, `--hold`, `--reason`, `--actor`. Add `--json` for structured output.



Read the affected record again and report what was saved. Never send, publish, decide liability or delete evidence.
