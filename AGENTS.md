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
- **Lifecycle**: Started when user begins work (~10 AM), stopped when user stops (~1 AM)

### Production Environment
- **Backend**: Runs on port 4000
- **Database**: `backend/prisma/prod.db`
- **Start**: `cd backend && PORT=4000 DATABASE_URL="file:./prisma/prod.db" npm run start:prod`
- **Lifecycle**: Runs 24/7, collects data continuously

**CRITICAL**: Both environments can and should run simultaneously. Never stop production to work on dev.

## Deployment Rules

### Production Deployment Process

1. **Build the code**:
   ```bash
   cd backend && npm run build
   ```

2. **Restart the production server** (code only):
   ```bash
   # Kill old process, start new one with built code
   PORT=4000 DATABASE_URL="file:./prisma/prod.db" npm run start:prod
   ```

3. **What to deploy**: ONLY the `dist/` folder (compiled code)

4. **What to NEVER touch**:
   - ❌ `backend/prisma/prod.db` - Production database
   - ❌ Any database files
   - ❌ Environment variables that point to databases

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
```bash
# 1. Build
cd backend && npm run build

# 2. Restart production (keeps same database)
# Find PID: ps aux | grep "node dist/main"
kill <PID>
PORT=4000 DATABASE_URL="file:./prisma/prod.db" nohup npm run start:prod > /tmp/backend-prod.log 2>&1 &
```

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
│   ├── prod.db       # Production database (runs 24/7)
│   └── schema.prisma # Database schema
frontend/
├── dist/              # Built frontend
├── src/               # Source code
```

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
