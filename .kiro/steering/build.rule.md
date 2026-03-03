# Build
## Purpose
Prevents commands that take over the terminal and cause loss of chat history.
## Instructions
- NEVER use watch mode (e.g. `npm run start:dev`, `tsc --watch`) — it takes over the terminal. Use one-shot builds like `npx nest build` instead. (ID: NO_WATCH_MODE)
- NEVER execute long-running or interactive commands that block the terminal. Always prefer detached or one-shot alternatives. (ID: NO_BLOCKING_COMMANDS)
## Priority
High
## Error Handling
- If a build or start command requires watch mode by default, find a non-blocking alternative or run it detached with `setsid`
