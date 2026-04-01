# Build
## Purpose
Prevents commands that take over the terminal and cause loss of chat history.
## Instructions
- NEVER run watch mode or long-running commands directly (e.g. `npm run start:dev`, `npm run dev`, `tsc --watch`) — they block the terminal. (ID: NO_WATCH_MODE)
- For one-shot builds, use `npx nest build` or `npx vite build`. (ID: ONE_SHOT_BUILD)
- To start dev servers, ALWAYS use `setsid` to fully detach: `setsid npm run start:dev > /tmp/log.log 2>&1 < /dev/null &` — this is the ONLY acceptable way to run watch mode commands. (ID: SETSID_FOR_SERVERS)
- After starting servers with `setsid`, verify status in a SEPARATE `execute_bash` call (check logs and ports). Do NOT combine start + sleep + verify in one command. (ID: VERIFY_SEPARATELY)
## Priority
High
## Error Handling
- If a `setsid` start doesn't work, inform the user and suggest they start the server manually
