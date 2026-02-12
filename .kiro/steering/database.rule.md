# Production
## Purpose
This rule prevents the agent to delete data from the database without explicitly asking the user for permission.
## Instructions
- Whenever changes to the database schema are required, that would lead to data loss or change, ALWAYS explain the planned changes, and WAIT FOR CONFIRMATION, before making the changes. (ID: CONFIRM_DATA_LOSS)
## Priority
Critical
## Error Handling
N/A