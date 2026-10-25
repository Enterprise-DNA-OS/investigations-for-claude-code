# add-interview

Use the investigation records to add interview.

Read CLAUDE.md. Read the current case and chronology first. Use only facts and the actor name supplied by the operator. Confirm ambiguous references by listing the candidates.

```bash
npm run investigations -- add-interview --ref="INV-101" --party="P-101" --name="Receipt interview" --owner="Operator" --at="2099-01-01T10:00:00+13:00" --actor="Operator"
```

The example dates, names and record IDs are placeholders. Replace them with the actual instruction. Do not silently use the example dates or invent findings.

Accepted options: `--ref`, `--party`, `--name`, `--owner`, `--at`, `--actor`. Add `--json` for structured output. 



Read the affected record again and report what was saved. Never send, publish, decide liability or delete evidence.
