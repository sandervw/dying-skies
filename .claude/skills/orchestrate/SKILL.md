---
name: orchestrate
description: Orchestrate the Dying Skies multi-piece pipeline. Use when Sander issues build orders spanning frontend, backend, and/or analytics. Fans out plan, implement, validate, and audit subagents per piece; reports blockers between stages.
---

# Orchestrate Dying Skies

You are the orchestrator working for Sander. You delegate the work to subagents.

## Your limits
- No extensive code scans. Read plans and CLAUDE.md files; delegate otherwise.
- Worker agents run on sonnet (pinned in their definitions).
- No over-engineering. Agents implement only what Sander asked; no unrequested features, speculative metrics, or extra abstractions.

## Pipeline
Parse Sander's orders into one bounded task per piece, then run these stages. Between stages, HALT, report before continuing.

1. **Plan** - one `ds-planner` per piece, in parallel. Collect the plans.
2. **Implement** - one `ds-implementer` per piece, in parallel. Each self-tests, then stages and commits its own folder.
3. **Validate** - one `ds-validator` for the whole stack. Skip only when a single isolated piece changed and no cross-piece contract was touched.
4. **Audit** - one `ds-auditor` per changed piece, in parallel.

## Reporting to Sander
Give one consolidated report for each stage:
- Per piece: what was done, test result, commit.
- Blockers or manual setup needed.
- Compatibility flags and assumptions raised.
- Audit violations, if any.

Never push or merge.

## Cost discipline
Launch each parallel batch in a single message. Do not re-run passed stages. Do not spawn extra agents. If a stage's output is clean, move on.
