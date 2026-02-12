# Agent Guidelines

This document provides critical context for AI agents working on this project.

## Project Overview

WarEra Calculator - A web application for tracking and visualizing market prices in the WarEra.io game.

- **Backend**: NestJS (port 3000 dev, port 4000 production)
- **Frontend**: React + Vite (port 5173)
- **Database**: SQLite with Prisma ORM

## Environment Separation

### Development Environment
- **Backend**: Runs on port 3000 (default)
- **Database**: `backend/prisma/dev.db`
- **Start**: `cd backend && npm run start:dev`
- **Lifecycle**: Started when user begins work, stopped when user stops

### Production Environment
- **Backend**: Runs on port 4000
- **Database**: Separate isolated location (see PRODUCTION_DEPLOY.md - not in repo)
- **Lifecycle**: Runs 24/7, collects data continuously

**CRITICAL**: 
- Development and production are COMPLETELY ISOLATED in separate directories
- Production location is documented in PRODUCTION_DEPLOY.md (private, not committed)
- NEVER touch production directory except during explicit deployment
- Both environments can and should run simultaneously

## Deployment Rules

### Production Deployment Process

**CRITICAL**: Production location is documented in PRODUCTION_DEPLOY.md (private file, not in repo). NEVER touch production except during explicit deployment!

1. **Build the code** (in dev directory):
   ```bash
   cd backend
   npm run build
   ```

2. **Deploy to production**: See PRODUCTION_DEPLOY.md for detailed instructions

3. **What to deploy**: ONLY the `dist/` folder (compiled code)

4. **What to NEVER touch**:
   - ❌ Production database file
   - ❌ Any database files
   - ❌ Production directory (except during deployment)

### Database Operations

**NEVER**:
- Copy `dev.db` to `prod.db` or vice versa
- Use `cp`, `mv`, `rsync` on database files
- Replace database files during deployment
- Run migrations that delete data without explicit user confirmation

**ALWAYS**:
- Use Prisma commands for schema changes: `npx prisma migrate`
- Create timestamped backups before production changes
- Ask for confirmation before any operation that might affect production data

### Why This Matters

**Incident 2026-02-12**: An agent copied `dev.db` over `prod.db` during deployment, destroying 17 hours of irreplaceable production data (01:30 AM - 18:48 PM). The dev database had a gap because dev servers were offline overnight, while production ran continuously collecting data.

**Solution**: Production is now completely isolated with its own database, dependencies, and environment. The development directory is never used for production.

**Lesson**: Database files are NOT part of deployment. They are persistent data stores that must never be touched during code deployments.

## Common Tasks

### Starting Development Work
```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Deploying to Production

See PRODUCTION_DEPLOY.md for detailed deployment instructions (private file, not in repo).

**Summary:**
1. Build code in dev directory
2. Copy `dist/` folder to production
3. Restart production server
4. NEVER touch database files

### Database Migrations
```bash
# Development
cd backend && npx prisma migrate dev --name <migration_name>

# Production (after testing in dev)
cd backend && DATABASE_URL="file:./prisma/prod.db" npx prisma migrate deploy
```

## Project Structure

```
backend/
├── dist/              # Built code (deploy this)
├── src/               # Source code
├── prisma/
│   ├── dev.db        # Dev database (has gaps when dev is offline)
│   ├── prod.db       # DEPRECATED - do not use
│   └── schema.prisma # Database schema
```

Production structure is documented in PRODUCTION_DEPLOY.md (not in repo).

## Data Collection

- **Cron jobs** run every hour (XX:05) to collect market prices and trading orders
- **Price updates** every 5 minutes
- Production must run continuously to avoid data gaps

## Key Principles

1. **Production data is irreplaceable** - No backups exist, data loss is permanent
2. **Environments are independent** - Dev and prod databases are completely separate
3. **Deployment = code only** - Never touch data during deployment
4. **When in doubt, ask** - If uncertain about production impact, stop and confirm with user

## Additional Resources

- See `.kiro/steering/*.rule.md` for detailed rules
- See `docs/` for technical documentation
- See `README.md` for setup instructions
