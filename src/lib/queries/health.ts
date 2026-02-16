export const DATABASE_SIZE_QUERY = `
SELECT
  DB_NAME() AS [database],
  SUM(CASE WHEN type = 0 THEN CAST(size * 8.0 / 1024 AS DECIMAL(18,2)) ELSE 0 END) AS dataSizeMB,
  SUM(CASE WHEN type = 1 THEN CAST(size * 8.0 / 1024 AS DECIMAL(18,2)) ELSE 0 END) AS logSizeMB,
  SUM(CAST(size * 8.0 / 1024 AS DECIMAL(18,2))) AS totalSizeMB
FROM sys.database_files;
`;

export const LOG_USAGE_QUERY = `
DBCC SQLPERF(LOGSPACE);
`;

export const BACKUP_INFO_QUERY = `
SELECT
  d.name AS [database],
  CASE bs.type
    WHEN 'D' THEN 'Full'
    WHEN 'I' THEN 'Differential'
    WHEN 'L' THEN 'Log'
    ELSE 'Other'
  END AS backupType,
  bs.backup_finish_date AS lastBackupDate,
  CAST(ISNULL(bs.backup_size / 1048576.0, 0) AS DECIMAL(18,2)) AS backupSizeMB,
  ISNULL(bs.compressed_backup_size, 0) AS compressed,
  DATEDIFF(HOUR, bs.backup_finish_date, GETDATE()) AS hoursAgo
FROM sys.databases d
LEFT JOIN (
  SELECT
    database_name,
    type,
    backup_finish_date,
    backup_size,
    compressed_backup_size,
    ROW_NUMBER() OVER (PARTITION BY database_name, type ORDER BY backup_finish_date DESC) AS rn
  FROM msdb.dbo.backupset
) bs ON d.name = bs.database_name AND bs.rn = 1
WHERE d.database_id > 4
ORDER BY d.name, bs.type;
`;

export const FILE_GROWTH_QUERY = `
SELECT
  DB_NAME() AS [database],
  mf.name AS fileName,
  mf.type_desc AS fileType,
  CAST(mf.size * 8.0 / 1024 AS DECIMAL(18,2)) AS sizeMB,
  CASE WHEN mf.max_size = -1 THEN NULL
    ELSE CAST(mf.max_size * 8.0 / 1024 AS DECIMAL(18,2))
  END AS maxSizeMB,
  CASE
    WHEN mf.is_percent_growth = 1 THEN CAST(mf.growth AS VARCHAR) + '%'
    ELSE CAST(CAST(mf.growth * 8.0 / 1024 AS DECIMAL(18,2)) AS VARCHAR) + ' MB'
  END AS growthSetting,
  CAST(FILEPROPERTY(mf.name, 'SpaceUsed') * 8.0 / 1024 AS DECIMAL(18,2)) AS spaceUsedMB,
  CAST((1 - CAST(FILEPROPERTY(mf.name, 'SpaceUsed') AS FLOAT) / NULLIF(mf.size, 0)) * 100 AS DECIMAL(5,2)) AS freePercent
FROM sys.database_files mf
ORDER BY mf.type, mf.name;
`;

export const UPTIME_QUERY = `
SELECT
  CONVERT(VARCHAR, DATEDIFF(DAY, sqlserver_start_time, GETDATE())) + 'd ' +
  CONVERT(VARCHAR, DATEDIFF(HOUR, sqlserver_start_time, GETDATE()) % 24) + 'h ' +
  CONVERT(VARCHAR, DATEDIFF(MINUTE, sqlserver_start_time, GETDATE()) % 60) + 'm' AS uptime
FROM sys.dm_os_sys_info;
`;

export const MEMORY_USAGE_QUERY = `
SELECT
  CAST(total_physical_memory_kb / 1024.0 AS INT) AS memoryTotalMB,
  CAST((total_physical_memory_kb - available_physical_memory_kb) / 1024.0 AS INT) AS memoryUsedMB
FROM sys.dm_os_sys_memory;
`;

export const BLOCKED_COUNT_QUERY = `
SELECT COUNT(*) AS blockedCount
FROM sys.dm_exec_requests
WHERE blocking_session_id > 0;
`;
