# Technology Stack

## Overview
This document outlines the complete technology stack for the WarEra Calculator application, designed to run on a Raspberry Pi and be accessible from PC and mobile devices.

---

## Backend

### Core Framework
- **NestJS** (v10+)
  - TypeScript-first Node.js framework
  - Modular architecture with dependency injection
  - Similar to C# ASP.NET Core (Controllers, Services, Modules)
  - Built-in validation and error handling

### Runtime
- **Node.js** (v18+ LTS)
  - JavaScript runtime for server-side execution
  - Efficient for I/O-bound operations
  - Low resource consumption (suitable for Raspberry Pi)

### Language
- **TypeScript** (v5+)
  - Strongly-typed JavaScript superset
  - Compile-time type checking
  - Enhanced IDE support and autocomplete
  - Similar to C# type system

### HTTP Client
- **Axios** (via @nestjs/axios)
  - Promise-based HTTP client
  - Used for calling WarEra API
  - Built-in request/response interceptors
  - Automatic JSON transformation

### Validation
- **class-validator** & **class-transformer**
  - Decorator-based validation (similar to C# DataAnnotations)
  - Runtime type checking
  - Automatic DTO transformation
  - Custom validation rules support

### Configuration
- **@nestjs/config**
  - Environment variable management
  - Type-safe configuration
  - Similar to appsettings.json in C#
  - Support for .env files

---

## Frontend

### Core Framework
- **React** (v18+)
  - Component-based UI library
  - Virtual DOM for efficient rendering
  - Large ecosystem and community support
  - Industry standard for web applications

### Build Tool
- **Vite** (v5+)
  - Next-generation frontend tooling
  - Lightning-fast hot module replacement (HMR)
  - Optimized production builds
  - Native ES modules support

### Language
- **TypeScript** (v5+)
  - Same language as backend for consistency
  - Type-safe props and state
  - Better refactoring support
  - Reduced runtime errors

### State Management & Data Fetching
- **TanStack Query** (React Query v5)
  - Server state management
  - Automatic caching and background refetching
  - Optimistic updates
  - Request deduplication

### HTTP Client
- **Axios**
  - Consistent with backend
  - Interceptors for auth tokens
  - Request/response transformation
  - Error handling

### UI Component Library
- **shadcn/ui** (Recommended)
  - Copy-paste component library
  - Built on Radix UI primitives
  - Fully customizable with Tailwind CSS
  - Accessible by default

**Alternative:** Material-UI (MUI)
  - Pre-built React components
  - Google Material Design
  - Extensive component library

### Styling
- **Tailwind CSS** (v3+)
  - Utility-first CSS framework
  - Rapid UI development
  - Small production bundle size
  - Responsive design utilities

### Data Visualization
- **Recharts**
  - React charting library
  - Built on D3.js
  - Composable chart components
  - Responsive and customizable

**Alternative:** Chart.js with react-chartjs-2
  - Simple and flexible
  - Good performance
  - Wide browser support

### Table/Grid
- **TanStack Table** (v8)
  - Headless table library
  - Sorting, filtering, pagination
  - Virtual scrolling for large datasets
  - Fully customizable

---

## Database (Optional but Recommended)

### Primary Database
- **PostgreSQL**
  - If more advanced features needed
  - Better for concurrent writes
  - Full-featured relational database

### ORM (Object-Relational Mapping)
- **Prisma** (Recommended)
  - Type-safe database client
  - Auto-generated TypeScript types
  - Database migrations
  - Visual database browser (Prisma Studio)
  - Similar to Entity Framework in C#

**Alternative:** TypeORM
  - Decorator-based (like C# attributes)
  - Active Record and Data Mapper patterns
  - More similar to Entity Framework

---

## Development Tools

### Package Manager
- **npm** or **pnpm**
  - npm: Default Node.js package manager
  - pnpm: Faster, more efficient disk usage

### Testing

#### Unit Testing
- **Jest**
  - JavaScript testing framework
  - Built into NestJS
  - Snapshot testing
  - Code coverage reports

---

## Deployment & Infrastructure

### Web Server
- **Built-in NestJS Server**
  - Express.js under the hood
  - Serves both API and static frontend files

**Optional:** **nginx**
  - Reverse proxy
  - Static file serving
  - SSL/TLS termination
  - Load balancing (if scaling)

### Process Management
- **PM2**
  - Node.js process manager
  - Auto-restart on crash
  - Log management
  - Cluster mode support

**Alternative:** **systemd**
  - Native Linux service manager
  - Built into Raspberry Pi OS
  - System-level integration

### Containerization (Optional)
- **Docker**
  - Containerize application
  - Consistent environments
  - Easy deployment
  - Isolated dependencies

### Environment Management
- **dotenv**
  - Load environment variables from .env file
  - Separate configs for dev/prod

---

## Networking & Access

### Local Network Access
- Direct IP access (e.g., `http://192.168.1.100:3000`)
- mDNS/Avahi for hostname resolution (e.g., `http://raspberrypi.local:3000`)

### Remote Access Options

#### VPN Solutions
- **Tailscale** (Recommended)
  - Zero-config VPN
  - Secure remote access
  - Works behind NAT
  - Free for personal use

- **ZeroTier**
  - Similar to Tailscale
  - Open-source alternative

#### Tunneling
- **Cloudflare Tunnel**
  - Expose local server to internet
  - No port forwarding needed
  - Free tier available
  - Built-in DDoS protection

- **ngrok**
  - Quick tunneling for development
  - HTTPS support
  - Custom domains (paid)

#### Traditional
- **Port Forwarding**
  - Configure router to forward ports
  - Use dynamic DNS (DuckDNS, No-IP)
  - Requires static IP or DDNS

### SSL/TLS
- **Let's Encrypt**
  - Free SSL certificates
  - Auto-renewal with Certbot
  - Required for HTTPS

---

## Monitoring & Logging (Optional)

### Logging
- **Winston** or **Pino**
  - Structured logging
  - Multiple transports (file, console)
  - Log rotation

### Monitoring
- **PM2 Monitoring**
  - Built-in process monitoring
  - CPU and memory usage

- **Prometheus + Grafana** (Advanced)
  - Metrics collection
  - Custom dashboards
  - Alerting

---

## Version Control

### Git
- **GitHub** / **GitLab** / **Bitbucket**
  - Source code management
  - Collaboration
  - CI/CD integration

---

## Hardware Requirements

### Raspberry Pi
- **Model:** Raspberry Pi 4 (4GB+ RAM recommended)
- **Storage:** 32GB+ microSD card (or SSD for better performance)
- **OS:** Raspberry Pi OS (64-bit) or Ubuntu Server
- **Network:** Ethernet (recommended) or WiFi

### Development Machine
- **OS:** Windows, macOS, or Linux
- **RAM:** 8GB+ recommended
- **Browser:** Chrome, Firefox, or Edge (latest version)

---

## Summary

### Backend Stack
```
NestJS (TypeScript) → Node.js → Raspberry Pi
├── Axios (HTTP client)
├── class-validator (validation)
├── Prisma (ORM)
└── SQLite (database)
```

### Frontend Stack
```
React (TypeScript) → Vite → Browser
├── TanStack Query (data fetching)
├── Axios (HTTP client)
├── shadcn/ui (components)
├── Tailwind CSS (styling)
├── Recharts (charts)
└── TanStack Table (tables)
```

### Development Stack
```
TypeScript + ESLint + Prettier
├── Jest (testing)
├── Git (version control)
└── VS Code (editor)
```

### Deployment Stack
```
PM2 (process manager)
├── nginx (optional reverse proxy)
├── Tailscale (remote access)
└── Let's Encrypt (SSL)
```

---

## Why This Stack?

### ✅ **TypeScript Everywhere**
- Single language for frontend and backend
- Type safety reduces bugs
- Better IDE support and refactoring
- Easier to learn (coming from C#)

### ✅ **NestJS = C# ASP.NET Core for Node.js**
- Familiar architecture and patterns
- Dependency injection
- Modular design
- Enterprise-ready

### ✅ **Raspberry Pi Optimized**
- Lightweight and efficient
- Low memory footprint
- Async I/O for better performance
- SQLite for minimal overhead

### ✅ **Modern & Maintainable**
- Active communities
- Regular updates
- Extensive documentation
- Large ecosystem of libraries

### ✅ **Production Ready**
- Battle-tested in enterprise
- Scalable architecture
- Security best practices
- Easy to deploy and monitor

---

## Next Steps

1. **Setup Development Environment**
   - Install Node.js (v18+)
   - Install VS Code
   - Install Git

2. **Initialize Projects**
   - Create NestJS backend
   - Create React frontend with Vite

3. **Configure Raspberry Pi**
   - Install Node.js on Pi
   - Setup PM2 or systemd
   - Configure network access

4. **Develop & Deploy**
   - Build features incrementally
   - Test locally
   - Deploy to Raspberry Pi
   - Access from PC/mobile

---

**Last Updated:** February 2026
**Status:** Recommended Stack for WarEra Calculator
