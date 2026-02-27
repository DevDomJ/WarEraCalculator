# Production
## Purpose
This rule dictates how to make sure the production server is available and not interrupted as long as possible.
## Instructions
- NEVER stop the PRODUCTION server to deploy something on the DEV server. Both servers can run at the same time, so we do not disturb the production server when we are working on dev. (ID: KEEP_PRODUCTION_RUNNING)
- Only deploy to production when explicitly prompted and ALWAYS ask for confirmation when deploying production (ID: CONFIRM_PROD_DEPLOY)
- NEVER copy, move, or overwrite the production database with ANY other database file, especially not dev.db. Production data is irreplaceable. The production database location is documented in PRODUCTION_DEPLOY.md (private, not in repo). (ID: DO_NOT_TOUCH_PROD_DB)
- BEFORE any production deployment, ALWAYS create a timestamped backup of the production database (e.g., prod.db.backup-YYYYMMDD-HHMMSS) in a safe location. See PRODUCTION_DEPLOY.md for the actual database path. (ID: BACKUP_BEFORE_DEPLOY)
- When deploying to production, ONLY deploy code changes (dist/ folder). NEVER include database files in deployment operations. (ID: DEPLOY_CODE_ONLY)
- If database migrations are needed in production, run them with Prisma migrate commands that preserve existing data, NEVER by replacing the database file. (ID: MIGRATE_NOT_REPLACE)
- Production and development are completely isolated in separate directories. Dev database: backend/prisma/dev.db. Production database: see PRODUCTION_DEPLOY.md. NEVER confuse these. (ID: SEPARATE_DB_PATHS)
- Production runs under pm2 process manager (process name: warera-prod). Use `pm2 restart warera-prod` to restart after deployment, NOT manual node commands or pkill. (ID: USE_PM2)
- To check production status, use `pm2 status` and `pm2 logs warera-prod`. (ID: PM2_MONITORING)
## Priority
Critical
## Error Handling
- If uncertain about which database is production vs dev, STOP and ask the user
- If a deployment command might affect the database, explain the risk and wait for explicit confirmation
- If pm2 is not installed or configured, refer to PRODUCTION_DEPLOY.md for setup instructions
