# add-evidence

Use the investigation records to add evidence.

Read CLAUDE.md. Read the current case and chronology first. Use only facts and the actor name supplied by the operator. Confirm ambiguous references by listing the candidates.

```bash
npm run investigations -- add-evidence --ref="INV-101" --code="EV-103" --name="Receipt copy" --holder="Operator" --location="Controlled evidence store" --file="tests/fixtures/evidence.txt" --basis="Operator supplied receipt" --review="2099-01-01" --actor="Operator"
```

The example dates, names and record IDs are placeholders. Replace them with the actual instruction. Do not silently use the example dates or invent findings.

Accepted options: `--ref`, `--code`, `--name`, `--holder`, `--location`, `--file`, `--basis`, `--review`, `--actor`. Add `--json` for structured output.



Read the affected record again and report what was saved. Never send, publish, decide liability or delete evidence.
