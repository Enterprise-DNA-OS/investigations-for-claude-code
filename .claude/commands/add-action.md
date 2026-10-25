---
description: "Investigation casework: add action"
---

# add-action

Use the investigation records to add action.

Read CLAUDE.md. Read the current case and chronology first. Use only facts and the actor name supplied by the operator. Confirm ambiguous references by listing the candidates.

```bash
npm run investigations -- add-action --ref="INV-101" --name="Compare receipts" --owner="Operator" --due="2099-01-01" --actor="Operator"
```

The example dates, names and record IDs are placeholders. Replace them with the actual instruction. Do not silently use the example dates or invent findings.

Accepted options: `--ref`, `--name`, `--owner`, `--due`, `--actor`. Add `--json` for structured output.



Read the affected record again and report what was saved. Never send, publish, decide liability or delete evidence.
