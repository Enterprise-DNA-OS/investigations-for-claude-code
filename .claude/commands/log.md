---
description: "Investigation casework: log"
---

# log

Use the investigation records to log.

Read CLAUDE.md. Read the current case and chronology first. Use only facts and the actor name supplied by the operator. Confirm ambiguous references by listing the candidates.

```bash
npm run investigations -- log --ref="INV-101" --name="Review note" --note="Operator supplied facts" --actor="Operator"
```

The example dates, names and record IDs are placeholders. Replace them with the actual instruction. Do not silently use the example dates or invent findings.

Accepted options: `--ref`, `--name`, `--note`, `--actor`. Add `--json` for structured output.



Read the affected record again and report what was saved. Never send, publish, decide liability or delete evidence.
