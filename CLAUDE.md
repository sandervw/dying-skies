# Dying Skies

Procedurally-generated "skies" as falling stars on a black field. Click a falling star to save it and open its sky. Full concept: `.docs/outline.md`.

**Conventions**
- Code files stay under 300 lines. Exceptions by user approval only.
- Comments stay under 12 words.
- Every exported function or object used outside its file carries a javadoc-style comment.
- Full descriptive names; the only short forms are `id`, `url`, `api`.
- **NEVER ADD FEATURES, FUNCTIONS, METHODS, OR FILES, WITHOUT PERMISSION**
- Never make a constant that is used in exactly one place.
- Never create a type to wrap around a simple primitive.
- Absolutely no new parameters or return values unless it is truly unavoidable.

**Config**
- Secrets live in each piece's `.env`, never committed. A tracked `.env.sample` lists the keys with empty values.
- Local `.env` and `.tfvars` files hold live secrets by design and are gitignored, not tracked. Do not flag them.

**Git**
- Do not run GIT commands without asking. This includes history commands.

**System**
- Windows/Linux only. Bash, `python`, `wc -w` for word counts.
- Soft-wrap prose. No em-dashes. Prefer non-Microsoft tooling.
