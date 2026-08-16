---
name: orchestrate
description: Orchestrate the Dying Skies multi-piece pipeline with Hermes delegation.
---

# Orchestrate Dying Skies with Hermes

Use this skill when Sander gives a bounded build order spanning one or more
Dying Skies pieces: `frontend/`, `backend/`, or `analytics/`.

## Operating rules

- Work from the repository root.
- Delegate all planning, implementation, validation, and auditing.
- Do not write or edit project files yourself.
- Never push, pull, merge, or alter Hermes configuration.
- Workers use the active Hermes model unless Sander explicitly requests another.
- Implementers stage and commit only their assigned piece; never push.
- Run parallel batches in one `delegate_task` call.
- Halt only for a blocker or required manual setup.

## Pipeline

1. Create one planner task per requested piece, in parallel.
2. Pass each plan to one implementer task per piece, in parallel.
3. Run one validator for the whole stack unless the change is isolated and
   clearly does not touch a cross-piece contract.
4. Run one auditor per changed piece, in parallel.
5. Report one consolidated result.

Do not re-run a passed stage or add extra agents.

## Hermes worker prompts

Use these role instructions in each delegated task.

### Planner

Read only the assigned piece's `CLAUDE.md`, `.docs_<piece>/plan.md`, and the
minimum relevant files. Do not use shell commands, build, test, or edit. Return:
files to change, ordered steps, existing build/test command, blockers, and
cross-piece assumptions.

### Implementer

Work only in the assigned piece. Follow the root and piece `CLAUDE.md` files
and the supplied plan. Implement exactly one bounded task. Run only the existing
build/test command. Stage and commit only the assigned piece with a subject
under 12 words. Never push, pull, merge, or edit another piece. Return changed
files, test result, commit subject and hash, assumptions, and manual setup.

### Validator

Read the root and relevant piece context. Check integration across changed
contracts. Run the minimum commands proving integration, without editing or
committing. Return PASS or FAIL, exact evidence, smallest fix direction if
needed, and integration risks.

### Auditor

Inspect only changed files in the assigned piece using `git diff` and read-only
commands. Check the root standards: code under 300 lines, docs under 700 words,
comments under 12 words, exported-symbol documentation, one primary export per
file, descriptive naming, no cross-piece imports, fresh docs, and no secrets.
Return PASS or violations as `file:line`, rule, and one-line fix.

## Final report

For each piece, report what changed, build/test result, and commit hash. Include
blockers, manual setup, compatibility flags, assumptions, and audit violations.
Never claim execution that a worker did not report.

## Model note

This skill does not pin a provider or model. Hermes applies the active
`delegation.*` settings, so it works with regular Luna without repo changes to
model configuration.

## Installation note

The committed skill lives at `.hermes/skills/orchestrate/`. To make Hermes
 discover it by name, configure that directory as a skill external directory:

```yaml
skills:
  external_dirs:
    - /absolute/path/to/dying-skies/.hermes/skills
```

This is a Hermes installation/profile setting, not a repository requirement.
Alternatively, copy the skill into the active Hermes skills directory.
