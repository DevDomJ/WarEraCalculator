# Production
## Purpose
This rule dictates how to make sure the production server is available and not interrupted as long as possible.
## Instructions
- NEVER stop the PRODUCTION server to deploy something on the DEV server. Both servers can run at the same time, so we do not disturb the production server when we are working on dev. (ID: KEEP_PRODUCTION_RUNNING)
- Only deploy to production when explicitly promted and ALWAYS ask for confirmation when deploying production (ID: CONFIRM_PROD_DEPLOY)
## Priority
High
## Error Handling
N/A