export const BLOCKING_CHAINS_QUERY = `
WITH BlockingTree AS (
  SELECT
    r.session_id AS blockedSessionId,
    r.blocking_session_id AS headBlockerSessionId,
    1 AS blockingLevel
  FROM sys.dm_exec_requests r
  WHERE r.blocking_session_id > 0

  UNION ALL

  SELECT
    bt.blockedSessionId,
    r.blocking_session_id,
    bt.blockingLevel + 1
  FROM BlockingTree bt
  JOIN sys.dm_exec_requests r ON bt.headBlockerSessionId = r.session_id
  WHERE r.blocking_session_id > 0
    AND bt.blockingLevel < 10
)
SELECT DISTINCT
  COALESCE(bt.headBlockerSessionId, r.blocking_session_id) AS headBlockerSessionId,
  hs.login_name AS headBlockerLoginName,
  hs.host_name AS headBlockerHostName,
  ISNULL(SUBSTRING(hst.text, 1, 500), '') AS headBlockerSqlText,
  ISNULL(hr.wait_time, 0) AS headBlockerWaitTime,
  ISNULL(hr.command, hs.status) AS headBlockerCommand,
  r.session_id AS blockedSessionId,
  bs.login_name AS blockedLoginName,
  SUBSTRING(bst.text,
    (r.statement_start_offset/2) + 1,
    ((CASE r.statement_end_offset
      WHEN -1 THEN DATALENGTH(bst.text)
      ELSE r.statement_end_offset
    END - r.statement_start_offset)/2) + 1) AS blockedSqlText,
  r.wait_time AS blockedWaitTime,
  r.wait_type AS blockedWaitType,
  ISNULL(bt.blockingLevel, 1) AS blockingLevel
FROM sys.dm_exec_requests r
JOIN sys.dm_exec_sessions bs ON r.session_id = bs.session_id
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) bst
LEFT JOIN BlockingTree bt ON r.session_id = bt.blockedSessionId
LEFT JOIN sys.dm_exec_sessions hs ON COALESCE(bt.headBlockerSessionId, r.blocking_session_id) = hs.session_id
LEFT JOIN sys.dm_exec_requests hr ON hs.session_id = hr.session_id
OUTER APPLY sys.dm_exec_sql_text(hr.sql_handle) hst
WHERE r.blocking_session_id > 0
ORDER BY headBlockerSessionId, blockingLevel;
`;

export const LOCK_WAITS_QUERY = `
SELECT
  tl.request_session_id AS sessionId,
  tl.resource_type AS resourceType,
  tl.resource_description AS resourceDescription,
  tl.request_mode AS lockMode,
  tl.request_status AS lockStatus,
  tl.resource_type AS lockType,
  OBJECT_NAME(p.object_id) AS objectName,
  wt.wait_duration_ms AS waitTimeMs
FROM sys.dm_tran_locks tl
LEFT JOIN sys.partitions p ON tl.resource_associated_entity_id = p.hobt_id
  AND tl.resource_type IN ('KEY', 'PAGE', 'RID', 'HOBT')
LEFT JOIN sys.dm_os_waiting_tasks wt ON tl.lock_owner_address = wt.resource_address
WHERE tl.request_status = 'WAIT'
ORDER BY wt.wait_duration_ms DESC;
`;
