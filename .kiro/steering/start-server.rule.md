# Start Server
## Purpose
Defines what steps to make sure when starting or restarting the application.
## Instructions
- After starting or restarting the frontend or backend servers, ALWAYS check if the servers are actually running, before telling the user to try to connect to them. (ID: CHECK_SERVER_STATUS)
- If the servers are not running or are not reachable, try to fix them.
## Priority
Low
## Error Handling
- If the servers can not start or run without errors for some reason, even after restarting them, inform the user about the errors and ask whether to abort or continue trying to fix the errors.