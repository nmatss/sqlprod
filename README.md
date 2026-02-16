# SQL Server Monitoring Dashboard

Real-time monitoring dashboard for SQL Server instances built with Next.js 15, TypeScript, Tailwind CSS, and Recharts.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Overview** - CPU, memory, active sessions, blocked processes, running jobs at a glance
- **Agent Jobs** - Job list, status, run history with duration chart, failed job alerts
- **Active Executions** - Running queries, top expensive queries from plan cache
- **Locks & Blocking** - Blocking chain visualization, head blocker identification, lock waits
- **Performance** - CPU history chart, wait statistics, I/O latency, missing index recommendations
- **Sessions & Users** - Active sessions, summary by login/host
- **Database Health** - Database size, backup status, file growth, log space usage

### Highlights

- Dual server monitoring (switch between servers or view both)
- Auto-refresh every 30 seconds (pause/resume)
- Color-coded alerts (green/yellow/red thresholds)
- Dark theme UI
- Resilient connections (`Promise.allSettled` - one server down doesn't break the other)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Icons | Lucide React |
| Database | mssql (node-mssql) |
| Deployment | Docker |

## Prerequisites

- Node.js 20+
- Access to SQL Server instances with `VIEW SERVER STATE` permission and `msdb` read access
- Docker (for production deployment)

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/nmatss/sqlprod.git
cd sqlprod
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your SQL Server credentials
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Docker Deployment

### Build and run

```bash
docker compose up -d --build
```

The dashboard will be available on port `3090`.

### Environment variables

Configure in `docker-compose.yml` or pass via `-e` flags:

| Variable | Description |
|----------|-------------|
| `DB01_HOST` | SQL Server 1 hostname |
| `DB01_PORT` | SQL Server 1 port (default: 1433) |
| `DB01_DATABASE` | Database name on server 1 |
| `DB02_HOST` | SQL Server 2 hostname |
| `DB02_PORT` | SQL Server 2 port (default: 1433) |
| `DB02_DATABASE` | Database name on server 2 |
| `DB_USER` | SQL Server login |
| `DB_PASSWORD` | SQL Server password |

## Project Structure

```
src/
├── app/
│   ├── api/monitor/          # 7 API routes (overview, jobs, executions, locks, performance, sessions, health)
│   ├── dashboard/            # 7 dashboard pages + layout shell
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Redirect to /dashboard
├── components/
│   ├── charts/               # CpuChart, WaitStatsChart, JobHistoryChart, GaugeChart
│   ├── layout/               # Sidebar, Topbar
│   ├── providers/            # ServerContext, RefreshContext
│   └── ui/                   # Card, StatusBadge, DataTable, LoadingSkeleton, ErrorAlert
├── hooks/
│   └── useMonitorData.ts     # Central polling hook (30s auto-refresh)
└── lib/
    ├── db.ts                 # Dual connection pool with globalThis persistence
    ├── types.ts              # TypeScript interfaces
    ├── utils.ts              # Formatting helpers
    └── queries/              # SQL DMV queries (jobs, executions, locks, performance, sessions, health)
```

## SQL Server Permissions

The monitoring user requires:

```sql
-- Server-level
GRANT VIEW SERVER STATE TO [your_user];

-- msdb access (for Agent Jobs)
USE msdb;
GRANT SELECT ON dbo.sysjobs TO [your_user];
GRANT SELECT ON dbo.sysjobhistory TO [your_user];
GRANT SELECT ON dbo.sysjobactivity TO [your_user];
GRANT SELECT ON dbo.syssessions TO [your_user];
GRANT SELECT ON dbo.sysjobschedules TO [your_user];
GRANT SELECT ON dbo.syscategories TO [your_user];
GRANT SELECT ON dbo.backupset TO [your_user];
```

## Alert Thresholds

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| CPU | < 60% | 60-85% | > 85% |
| PLE (Page Life Expectancy) | > 300s | 150-300s | < 150s |
| Buffer Cache Hit Ratio | > 95% | 90-95% | < 90% |
| Backup Age | < 24h | 24-48h | > 48h |
| I/O Read Latency | < 10ms | 10-20ms | > 20ms |
| Blocking | 0 | - | > 0 |

## License

MIT
