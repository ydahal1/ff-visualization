// Generated on 01/27/2026, 16:58:03 (EST)
// Total records: 1

export const systemMetrics = [
  {
    "timestamp": "2026-01-27T21:58:02.241Z",
    "platform": "darwin",
    "environment": "production",
    "ssl": {
      "skipped": true,
      "reason": "Development environment"
    },
    "disk": [
      {
        "filesystem": "/dev/disk1s1s1",
        "size": "466Gi",
        "used": "11Gi",
        "available": "47Gi",
        "usePercent": "20%",
        "mountPoint": "453k"
      },
      {
        "filesystem": "/dev/disk1s2",
        "size": "466Gi",
        "used": "402Gi",
        "available": "47Gi",
        "usePercent": "90%",
        "mountPoint": "5.0M"
      }
    ],
    "memory": {
      "total": "16.00GB",
      "used": "15.68GB",
      "free": "0.32GB",
      "usePercent": 98
    },
    "docker": {
      "skipped": true,
      "reason": "Docker not available"
    },
    "database": {
      "database": "new-ff-db",
      "sizeMB": "1.06"
    },
    "redis": {
      "skipped": true,
      "reason": "Redis/Docker not available"
    },
    "cpu": {
      "1min": 4.06,
      "5min": 4.04,
      "15min": 3.93
    }
  }
];
