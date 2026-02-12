# Database
## Purpose
This rule prevents the agent from deleting or corrupting data in the database without explicitly asking the user for permission.
## Instructions
- Whenever changes to the database schema are required that would lead to data loss or change, ALWAYS explain the planned changes, and WAIT FOR CONFIRMATION, before making the changes. (ID: CONFIRM_DATA_LOSS)
- NEVER copy, move, or replace database files between environments (dev.db <-> prod.db). Each environment's database is sacred. (ID: NO_DB_FILE_OPERATIONS)
- NEVER use file system commands (cp, mv, rsync) to manipulate database files. Use Prisma commands instead. (ID: USE_PRISMA_ONLY)
- If data needs to be transferred between databases, use proper export/import or migration tools, NEVER file copying. (ID: PROPER_DATA_TRANSFER)
## Priority
Critical
## Error Handling
- If uncertain about the impact of a database operation, STOP and ask the user
- If a command might overwrite or delete database data, explain the risk and wait for explicit confirmation