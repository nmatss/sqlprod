export const SESSIONS_QUERY = `
SELECT
  s.session_id AS sessionId,
  s.login_name AS loginName,
  s.host_name AS hostName,
  s.program_name AS programName,
  s.status,
  ISNULL(DB_NAME(s.database_id), '') AS [database],
  s.login_time AS loginTime,
  s.last_request_start_time AS lastRequestStartTime,
  s.cpu_time AS cpuTime,
  s.memory_usage * 8 AS memoryUsageKB,
  s.reads,
  s.writes,
  s.is_user_process AS isUserProcess
FROM sys.dm_exec_sessions s
WHERE s.is_user_process = 1
ORDER BY s.cpu_time DESC;
`;

export const SESSION_SUMMARY_QUERY = `
SELECT
  s.login_name AS loginName,
  COUNT(*) AS sessionCount,
  SUM(s.cpu_time) AS totalCpu,
  SUM(s.reads) AS totalReads
FROM sys.dm_exec_sessions s
WHERE s.is_user_process = 1
GROUP BY s.login_name
ORDER BY sessionCount DESC;
`;

export const ACTIVE_SESSION_COUNT_QUERY = `
SELECT COUNT(*) AS activeSessions
FROM sys.dm_exec_sessions
WHERE is_user_process = 1 AND status = 'running';
`;
