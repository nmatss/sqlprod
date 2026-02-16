export const JOBS_LIST_QUERY = `
SELECT
  j.job_id AS jobId,
  j.name AS jobName,
  j.enabled,
  c.name AS category,
  CASE ja.run_requested_date
    WHEN NULL THEN 0
    ELSE CASE WHEN ja.stop_execution_date IS NULL THEN 1 ELSE 0 END
  END AS currentlyRunning,
  CASE h.run_status
    WHEN 0 THEN 'Failed'
    WHEN 1 THEN 'Succeeded'
    WHEN 2 THEN 'Retry'
    WHEN 3 THEN 'Canceled'
    WHEN 4 THEN 'In Progress'
    ELSE 'Unknown'
  END AS lastRunStatus,
  CASE
    WHEN h.run_date IS NOT NULL THEN
      CONVERT(VARCHAR, CONVERT(DATETIME,
        STUFF(STUFF(CAST(h.run_date AS VARCHAR),7,0,'-'),5,0,'-') + ' ' +
        STUFF(STUFF(RIGHT('000000' + CAST(h.run_time AS VARCHAR),6),5,0,':'),3,0,':')), 120)
    ELSE NULL
  END AS lastRunDate,
  ISNULL(h.run_duration / 10000 * 3600 + (h.run_duration % 10000) / 100 * 60 + h.run_duration % 100, 0) AS lastRunDurationSec,
  CASE
    WHEN s.next_run_date > 0 THEN
      CONVERT(VARCHAR, CONVERT(DATETIME,
        STUFF(STUFF(CAST(s.next_run_date AS VARCHAR),7,0,'-'),5,0,'-') + ' ' +
        STUFF(STUFF(RIGHT('000000' + CAST(s.next_run_time AS VARCHAR),6),5,0,':'),3,0,':')), 120)
    ELSE NULL
  END AS nextRunDate
FROM msdb.dbo.sysjobs j
LEFT JOIN msdb.dbo.syscategories c ON j.category_id = c.category_id
LEFT JOIN msdb.dbo.sysjobactivity ja ON j.job_id = ja.job_id
  AND ja.session_id = (SELECT MAX(session_id) FROM msdb.dbo.syssessions)
LEFT JOIN msdb.dbo.sysjobschedules s ON j.job_id = s.job_id
OUTER APPLY (
  SELECT TOP 1 run_status, run_date, run_time, run_duration
  FROM msdb.dbo.sysjobhistory jh
  WHERE jh.job_id = j.job_id AND jh.step_id = 0
  ORDER BY jh.run_date DESC, jh.run_time DESC
) h
ORDER BY j.name;
`;

export const JOBS_HISTORY_QUERY = `
SELECT TOP 100
  j.name AS jobName,
  CONVERT(VARCHAR, CONVERT(DATETIME,
    STUFF(STUFF(CAST(h.run_date AS VARCHAR),7,0,'-'),5,0,'-') + ' ' +
    STUFF(STUFF(RIGHT('000000' + CAST(h.run_time AS VARCHAR),6),5,0,':'),3,0,':')), 120) AS runDate,
  h.run_duration / 10000 * 3600 + (h.run_duration % 10000) / 100 * 60 + h.run_duration % 100 AS runDurationSec,
  CASE h.run_status
    WHEN 0 THEN 'Failed'
    WHEN 1 THEN 'Succeeded'
    WHEN 2 THEN 'Retry'
    WHEN 3 THEN 'Canceled'
    WHEN 4 THEN 'In Progress'
    ELSE 'Unknown'
  END AS status,
  h.message
FROM msdb.dbo.sysjobhistory h
JOIN msdb.dbo.sysjobs j ON h.job_id = j.job_id
WHERE h.step_id = 0
ORDER BY h.run_date DESC, h.run_time DESC;
`;

export const RUNNING_JOBS_QUERY = `
SELECT
  j.name AS jobName,
  ja.run_requested_date AS startTime,
  DATEDIFF(SECOND, ja.run_requested_date, GETDATE()) AS elapsedSec
FROM msdb.dbo.sysjobactivity ja
JOIN msdb.dbo.sysjobs j ON ja.job_id = j.job_id
WHERE ja.session_id = (SELECT MAX(session_id) FROM msdb.dbo.syssessions)
  AND ja.run_requested_date IS NOT NULL
  AND ja.stop_execution_date IS NULL;
`;

export const FAILED_JOBS_24H_QUERY = `
SELECT COUNT(*) AS failedCount
FROM msdb.dbo.sysjobhistory h
WHERE h.step_id = 0
  AND h.run_status = 0
  AND CONVERT(DATETIME,
    STUFF(STUFF(CAST(h.run_date AS VARCHAR),7,0,'-'),5,0,'-') + ' ' +
    STUFF(STUFF(RIGHT('000000' + CAST(h.run_time AS VARCHAR),6),5,0,':'),3,0,':'))
  >= DATEADD(HOUR, -24, GETDATE());
`;
