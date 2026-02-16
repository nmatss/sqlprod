export const ACTIVE_QUERIES_QUERY = `
SELECT
  r.session_id AS sessionId,
  r.request_id AS requestId,
  r.start_time AS startTime,
  DATEDIFF(MILLISECOND, r.start_time, GETDATE()) AS elapsedMs,
  r.status,
  r.command,
  DB_NAME(r.database_id) AS [database],
  s.login_name AS loginName,
  s.host_name AS hostName,
  r.cpu_time AS cpuTime,
  r.reads,
  r.writes,
  r.wait_type AS waitType,
  r.wait_time AS waitTime,
  r.blocking_session_id AS blockingSessionId,
  SUBSTRING(st.text,
    (r.statement_start_offset/2) + 1,
    ((CASE r.statement_end_offset
      WHEN -1 THEN DATALENGTH(st.text)
      ELSE r.statement_end_offset
    END - r.statement_start_offset)/2) + 1) AS sqlText
FROM sys.dm_exec_requests r
JOIN sys.dm_exec_sessions s ON r.session_id = s.session_id
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) st
WHERE s.is_user_process = 1
ORDER BY r.cpu_time DESC;
`;

export const EXPENSIVE_QUERIES_QUERY = `
SELECT TOP 20
  SUBSTRING(st.text, (qs.statement_start_offset/2) + 1,
    ((CASE qs.statement_end_offset
      WHEN -1 THEN DATALENGTH(st.text)
      ELSE qs.statement_end_offset
    END - qs.statement_start_offset)/2) + 1) AS sqlText,
  qs.execution_count AS executionCount,
  qs.total_worker_time / 1000 AS totalWorkerTimeMs,
  (qs.total_worker_time / qs.execution_count) / 1000 AS avgWorkerTimeMs,
  qs.total_elapsed_time / 1000 AS totalElapsedTimeMs,
  qs.total_logical_reads AS totalLogicalReads,
  qs.total_logical_reads / qs.execution_count AS avgLogicalReads,
  qs.total_logical_writes AS totalLogicalWrites,
  qs.last_execution_time AS lastExecutionTime
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY qs.total_worker_time DESC;
`;
