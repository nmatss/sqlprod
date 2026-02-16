export type ServerKey = 'db01' | 'db02';

export interface ServerInfo {
  key: ServerKey;
  label: string;
  host: string;
  database: string;
}

export const SERVERS: Record<ServerKey, ServerInfo> = {
  db01: { key: 'db01', label: 'DB01 - Server 1', host: '', database: '' },
  db02: { key: 'db02', label: 'DB02 - Server 2', host: '', database: '' },
};

// ---- Overview ----
export interface OverviewData {
  server: ServerKey;
  cpuPercent: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  activeSessions: number;
  blockedProcesses: number;
  runningJobs: number;
  failedJobsLast24h: number;
  databaseSizeMB: number;
  logUsedPercent: number;
  lastBackup: string | null;
  pleSeconds: number;
  batchRequestsSec: number;
  uptime: string;
}

// ---- Jobs ----
export interface JobInfo {
  server: ServerKey;
  jobId: string;
  jobName: string;
  enabled: boolean;
  lastRunStatus: string;
  lastRunDate: string | null;
  lastRunDurationSec: number;
  nextRunDate: string | null;
  currentlyRunning: boolean;
  category: string;
}

export interface JobHistoryEntry {
  server: ServerKey;
  jobName: string;
  runDate: string;
  runDurationSec: number;
  status: string;
  message: string;
}

// ---- Executions ----
export interface ActiveQuery {
  server: ServerKey;
  sessionId: number;
  requestId: number;
  startTime: string;
  elapsedMs: number;
  status: string;
  command: string;
  database: string;
  loginName: string;
  hostName: string;
  cpuTime: number;
  reads: number;
  writes: number;
  waitType: string | null;
  waitTime: number;
  blockingSessionId: number | null;
  sqlText: string;
  queryPlan: string | null;
}

export interface ExpensiveQuery {
  server: ServerKey;
  sqlText: string;
  executionCount: number;
  totalWorkerTimeMs: number;
  avgWorkerTimeMs: number;
  totalElapsedTimeMs: number;
  totalLogicalReads: number;
  avgLogicalReads: number;
  totalLogicalWrites: number;
  lastExecutionTime: string;
}

// ---- Locks ----
export interface BlockingChain {
  server: ServerKey;
  headBlockerSessionId: number;
  headBlockerLoginName: string;
  headBlockerHostName: string;
  headBlockerSqlText: string;
  headBlockerWaitTime: number;
  headBlockerCommand: string;
  blockedSessionId: number;
  blockedLoginName: string;
  blockedSqlText: string;
  blockedWaitTime: number;
  blockedWaitType: string;
  blockingLevel: number;
}

export interface LockWait {
  server: ServerKey;
  sessionId: number;
  lockType: string;
  lockMode: string;
  lockStatus: string;
  resourceType: string;
  resourceDescription: string;
  objectName: string | null;
  waitTimeMs: number;
}

// ---- Performance ----
export interface CpuSample {
  eventTime: string;
  sqlProcessPercent: number;
  systemIdlePercent: number;
  otherProcessPercent: number;
}

export interface WaitStat {
  server: ServerKey;
  waitType: string;
  waitingTasksCount: number;
  waitTimeMs: number;
  signalWaitTimeMs: number;
  avgWaitMs: number;
}

export interface IoStat {
  server: ServerKey;
  database: string;
  fileType: string;
  fileName: string;
  readsMB: number;
  writesMB: number;
  ioStallReadMs: number;
  ioStallWriteMs: number;
  avgReadLatencyMs: number;
  avgWriteLatencyMs: number;
}

export interface MissingIndex {
  server: ServerKey;
  database: string;
  tableName: string;
  equalityColumns: string | null;
  inequalityColumns: string | null;
  includedColumns: string | null;
  userSeeks: number;
  userScans: number;
  avgUserImpact: number;
  improvementMeasure: number;
}

export interface PerformanceCounters {
  server: ServerKey;
  pleSeconds: number;
  batchRequestsSec: number;
  compilationsSec: number;
  recompilationsSec: number;
  bufferCacheHitRatio: number;
  targetMemoryMB: number;
  totalMemoryMB: number;
}

// ---- Sessions ----
export interface SessionInfo {
  server: ServerKey;
  sessionId: number;
  loginName: string;
  hostName: string;
  programName: string;
  status: string;
  database: string;
  loginTime: string;
  lastRequestStartTime: string;
  cpuTime: number;
  memoryUsageKB: number;
  reads: number;
  writes: number;
  isUserProcess: boolean;
}

export interface SessionSummary {
  server: ServerKey;
  loginName: string;
  sessionCount: number;
  totalCpu: number;
  totalReads: number;
}

// ---- Health ----
export interface DatabaseSize {
  server: ServerKey;
  database: string;
  dataSizeMB: number;
  logSizeMB: number;
  logUsedPercent: number;
  totalSizeMB: number;
}

export interface BackupInfo {
  server: ServerKey;
  database: string;
  backupType: string;
  lastBackupDate: string | null;
  backupSizeMB: number;
  compressed: boolean;
  hoursAgo: number | null;
}

export interface FileGrowth {
  server: ServerKey;
  database: string;
  fileName: string;
  fileType: string;
  sizeMB: number;
  maxSizeMB: number | null;
  growthSetting: string;
  spaceUsedMB: number;
  freePercent: number;
}

// ---- API Response Wrapper ----
export interface MonitorResponse<T> {
  success: boolean;
  data: T[];
  errors?: { server: ServerKey; message: string }[];
  timestamp: string;
}
