# Update Documentation

Review and update all documentation files to reflect the changes made in this session.

## Steps

1. Read all uncommitted changes (`git diff --stat` + `git diff`) to understand what was changed
2. For each type of change, update the **canonical location** only:
   - New or changed API endpoints → `docs/DEVELOPMENT.md` API table
   - New or changed database models/fields → `docs/DEVELOPMENT.md` models table
   - New or changed features → `docs/PROJECT.md` status table + `docs/FEATURES.md` entry
   - New or changed modules/components/files → `docs/PROJECT.md` project structure tree (canonical)
   - New or changed game mechanics/formulas → `docs/GAME_MECHANICS.md`
   - Changed operational parameters (ports, cron schedules, etc.) → `AGENTS.md`
3. Apply only the necessary updates — don't rewrite files that are already accurate
4. If nothing needs updating, say so and skip this step

## Canonical locations (avoid duplication)

- **Project structure tree**: `docs/PROJECT.md` only (README.md and DEVELOPMENT.md link to it)
- **API endpoint table**: `docs/DEVELOPMENT.md` only (README.md links to it)
- **SQLite design decision**: `docs/PROJECT.md` only (DEVELOPMENT.md links to it)
- **Feature status**: `docs/PROJECT.md` table + `docs/FEATURES.md` details

## Rules

- Do NOT update `docs/plan.md`, `docs/requirements.md`, or `docs/techStack.md` — these are historical documents
- Do NOT invent or assume features that weren't part of the changes — only document what actually changed
- Keep the existing style and structure of each documentation file
- Avoid duplicating information across files — update the canonical location and ensure links are intact
