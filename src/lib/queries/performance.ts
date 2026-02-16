export const CPU_HISTORY_QUERY = `
SELECT TOP 30
  DATEADD(ms, -1 * (ts_now - [timestamp]), GETDATE()) AS eventTime,
  SQLProcessUtilization AS sqlProcessPercent,
  SystemIdle AS systemIdlePercent,
  100 - SystemIdle - SQLProcessUtilization AS otherProcessPercent
FROM (
  SELECT
    record.value('(./Record/@id)[1]', 'int') AS record_id,
    record.value('(./Record/SchedulerMonitorEvent/SystemHealth/SystemIdle)[1]', 'int') AS SystemIdle,
    record.value('(./Record/SchedulerMonitorEvent/SystemHealth/ProcessUtilization)[1]', 'int') AS SQLProcessUtilization,
    [timestamp],
    (SELECT cpu_ticks / (cpu_ticks / ms_ticks) FROM sys.dm_os_sys_info) AS ts_now
  FROM (
    SELECT [timestamp], CONVERT(xml, record) AS record
    FROM sys.dm_os_ring_buffers
    WHERE ring_buffer_type = N'RING_BUFFER_SCHEDULER_MONITOR'
      AND record LIKE '%<SystemHealth>%'
  ) AS x
) AS y
ORDER BY eventTime DESC;
`;

export const WAIT_STATS_QUERY = `
SELECT TOP 15
  wait_type AS waitType,
  waiting_tasks_count AS waitingTasksCount,
  wait_time_ms AS waitTimeMs,
  signal_wait_time_ms AS signalWaitTimeMs,
  CASE WHEN waiting_tasks_count > 0
    THEN wait_time_ms / waiting_tasks_count
    ELSE 0
  END AS avgWaitMs
FROM sys.dm_os_wait_stats
WHERE wait_type NOT IN (
  'CLR_SEMAPHORE','LAZYWRITER_SLEEP','RESOURCE_QUEUE','SQLTRACE_BUFFER_FLUSH',
  'SLEEP_TASK','SLEEP_SYSTEMTASK','WAITFOR','HADR_FILESTREAM_IOMGR_IOCOMPLETION',
  'CHECKPOINT_QUEUE','REQUEST_FOR_DEADLOCK_SEARCH','XE_TIMER_EVENT','XE_DISPATCHER_JOIN',
  'LOGMGR_QUEUE','FT_IFTS_SCHEDULER_IDLE_WAIT','BROKER_TASK_STOP','CLR_MANUAL_EVENT',
  'CLR_AUTO_EVENT','DISPATCHER_QUEUE_SEMAPHORE','TRACEWRITE','XE_DISPATCHER_WAIT',
  'BROKER_TO_FLUSH','BROKER_EVENTHANDLER','FT_IFTSHC_MUTEX','SQLTRACE_INCREMENTAL_FLUSH_SLEEP',
  'DIRTY_PAGE_POLL','SP_SERVER_DIAGNOSTICS_SLEEP','HADR_WORK_QUEUE','QDS_PERSIST_TASK_MAIN_LOOP_SLEEP',
  'QDS_ASYNC_QUEUE','QDS_CLEANUP_STALE_QUERIES_TASK_MAIN_LOOP_SLEEP'
)
AND waiting_tasks_count > 0
ORDER BY wait_time_ms DESC;
`;

export const IO_STATS_QUERY = `
SELECT
  DB_NAME(fs.database_id) AS [database],
  mf.type_desc AS fileType,
  mf.physical_name AS fileName,
  CAST(fs.num_of_bytes_read / 1048576.0 AS DECIMAL(18,2)) AS readsMB,
  CAST(fs.num_of_bytes_written / 1048576.0 AS DECIMAL(18,2)) AS writesMB,
  fs.io_stall_read_ms AS ioStallReadMs,
  fs.io_stall_write_ms AS ioStallWriteMs,
  CASE WHEN fs.num_of_reads > 0
    THEN CAST(fs.io_stall_read_ms / fs.num_of_reads AS DECIMAL(18,2))
    ELSE 0
  END AS avgReadLatencyMs,
  CASE WHEN fs.num_of_writes > 0
    THEN CAST(fs.io_stall_write_ms / fs.num_of_writes AS DECIMAL(18,2))
    ELSE 0
  END AS avgWriteLatencyMs
FROM sys.dm_io_virtual_file_stats(NULL, NULL) fs
JOIN sys.master_files mf ON fs.database_id = mf.database_id AND fs.file_id = mf.file_id
ORDER BY (fs.io_stall_read_ms + fs.io_stall_write_ms) DESC;
`;

export const MISSING_INDEXES_QUERY = `
SELECT TOP 20
  DB_NAME(mid.database_id) AS [database],
  OBJECT_NAME(mid.object_id, mid.database_id) AS tableName,
  mid.equality_columns AS equalityColumns,
  mid.inequality_columns AS inequalityColumns,
  mid.included_columns AS includedColumns,
  migs.user_seeks AS userSeeks,
  migs.user_scans AS userScans,
  migs.avg_user_impact AS avgUserImpact,
  CAST(migs.user_seeks * migs.avg_user_impact * (migs.avg_total_user_cost * migs.avg_user_impact) AS DECIMAL(18,2)) AS improvementMeasure
FROM sys.dm_db_missing_index_details mid
JOIN sys.dm_db_missing_index_groups mig ON mid.index_handle = mig.index_handle
JOIN sys.dm_db_missing_index_group_stats migs ON mig.index_group_handle = migs.group_handle
WHERE mid.database_id = DB_ID()
ORDER BY improvementMeasure DESC;
`;

export const PERFORMANCE_COUNTERS_QUERY = `
SELECT
  MAX(CASE WHEN counter_name = 'Page life expectancy' AND object_name LIKE '%Buffer Manager%'
    THEN cntr_value ELSE NULL END) AS pleSeconds,
  MAX(CASE WHEN counter_name = 'Batch Requests/sec'
    THEN cntr_value ELSE NULL END) AS batchRequestsSec,
  MAX(CASE WHEN counter_name = 'SQL Compilations/sec'
    THEN cntr_value ELSE NULL END) AS compilationsSec,
  MAX(CASE WHEN counter_name = 'SQL Re-Compilations/sec'
    THEN cntr_value ELSE NULL END) AS recompilationsSec,
  MAX(CASE WHEN counter_name = 'Buffer cache hit ratio'
    THEN cntr_value ELSE NULL END) AS bufferCacheHitRatio,
  MAX(CASE WHEN counter_name = 'Target Server Memory (KB)'
    THEN cntr_value / 1024 ELSE NULL END) AS targetMemoryMB,
  MAX(CASE WHEN counter_name = 'Total Server Memory (KB)'
    THEN cntr_value / 1024 ELSE NULL END) AS totalMemoryMB
FROM sys.dm_os_performance_counters
WHERE counter_name IN (
  'Page life expectancy', 'Batch Requests/sec',
  'SQL Compilations/sec', 'SQL Re-Compilations/sec',
  'Buffer cache hit ratio', 'Target Server Memory (KB)',
  'Total Server Memory (KB)'
);
`;

export const CURRENT_CPU_QUERY = `
SELECT
  SQLProcessUtilization AS cpuPercent,
  SystemIdle AS systemIdlePercent
FROM (
  SELECT
    record.value('(./Record/SchedulerMonitorEvent/SystemHealth/SystemIdle)[1]', 'int') AS SystemIdle,
    record.value('(./Record/SchedulerMonitorEvent/SystemHealth/ProcessUtilization)[1]', 'int') AS SQLProcessUtilization
  FROM (
    SELECT TOP 1 CONVERT(xml, record) AS record
    FROM sys.dm_os_ring_buffers
    WHERE ring_buffer_type = N'RING_BUFFER_SCHEDULER_MONITOR'
      AND record LIKE '%<SystemHealth>%'
    ORDER BY [timestamp] DESC
  ) AS x
) AS y;
`;
