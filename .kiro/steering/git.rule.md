# Git
## Purpose
This rule dictates kiro (the agent) behavior related to git.
## Instructions
- ALWAYS check for other changes made not related to the current session. If you find any, ask the user if those changes should be committed as well, as separate commit, or be left out. ALWAYS wait for confirmation from user before you continue. (ID: GIT_CHECK_CHANGES)
- ALWAYS ask confirmation from the user before pushing to git (ID: GIT_PUSH)
- ALWAYS ensure commit messages are meaningful and detailed, including what was changed and why (ID: GIT_COMMIT)
- Commit message should be accurate but playful and not too formal, with comprehensive details about the changes (ID: GIT_COMMIT_STYLE)
- Include specific files/components modified and the impact of changes in commit messages (ID: GIT_COMMIT_DETAILS)
## Priority
Medium
## Error Handling
N/A