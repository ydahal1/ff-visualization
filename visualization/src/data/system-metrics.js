// Generated on 01/27/2026, 16:57:03 (EST)
// Total records: 1

export const systemMetrics = [
  {
    "timestamp": "2026-01-27T21:57:02.454Z",
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
      "used": "15.95GB",
      "free": "0.05GB",
      "usePercent": 100
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
      "1min": 5.91,
      "5min": 4.28,
      "15min": 4
    }
  }
];
