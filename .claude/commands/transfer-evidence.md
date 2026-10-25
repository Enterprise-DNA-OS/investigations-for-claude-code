---
description: "Investigation casework: transfer evidence"
---

# transfer-evidence

Use the investigation records to transfer evidence.

Read CLAUDE.md. Read the current case and chronology first. Use only facts and the actor name supplied by the operator. Confirm ambiguous references by listing the candidates.

```bash
npm run investigations -- transfer-evidence --ref="EV-101" --from="Aroha" --to="Reviewer" --location="Controlled review room" --reason="Recorded handover" --actor="Operator"
```

The example dates, names and record IDs are placeholders. Replace them with the actual instruction. Do not silently use the example dates or invent findings.

Accepted options: `--ref`, `--from`, `--to`, `--location`, `--reason`, `--actor`. Add `--json` for structured output.



Read the affected record again and report what was saved. Never send, publish, decide liability or delete evidence.
