# complete-action

Use the investigation records to complete action.

Read CLAUDE.md. Read the current case and chronology first. Use only facts and the actor name supplied by the operator. Confirm ambiguous references by listing the candidates.

```bash
npm run investigations -- complete-action --ref="action name or ID" --result="Recorded comparison result" --actor="Operator"
```

The example dates, names and record IDs are placeholders. Replace them with the actual instruction. Do not silently use the example dates or invent findings.

Accepted options: `--ref`, `--result`, `--actor`. Add `--json` for structured output. 



Read the affected record again and report what was saved. Never send, publish, decide liability or delete evidence.
