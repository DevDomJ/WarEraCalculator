# Commit Changes

Commit the current uncommitted changes.

## Steps

1. Review all uncommitted changes (`git status` + `git diff`)
2. Identify unrelated changes — ask the user how to handle them before proceeding
3. Group related changes into logical commits (don't lump unrelated work together)
4. For each commit, write a message following the project's git rules (see `git.rule.md`)
5. Stage and commit each group
6. Ask for confirmation before pushing
