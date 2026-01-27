import React from 'react';
import { systemMetrics } from '../../data/system-metrics';
import styles from './SystemMetrics.module.css';

// Helper to group metrics logically by category
const groupMetrics = (metrics) => {
  if (!metrics) return [];
  const groups = [];
  // Group certain keys together
  const categories = [
    { name: 'System', keys: ['timestamp', 'platform', 'environment'] },
    { name: 'SSL', keys: ['ssl'] },
    { name: 'Disk', keys: ['disk'] },
    { name: 'Memory', keys: ['memory'] },
    { name: 'Docker', keys: ['docker'] },
    { name: 'Database', keys: ['database'] },
    { name: 'Redis', keys: ['redis'] },
    { name: 'CPU', keys: ['cpu'] },
  ];
  categories.forEach(cat => {
    const items = [];
    cat.keys.forEach(key => {
      if (metrics[key] !== undefined) {
        items.push([key, metrics[key]]);
      }
    });
    if (items.length > 0) {
      groups.push({ name: cat.name, items });
    }
  });
  // Add any remaining keys
  const usedKeys = categories.flatMap(cat => cat.keys);
  const otherItems = Object.entries(metrics).filter(([key]) => !usedKeys.includes(key));
  if (otherItems.length > 0) {
    groups.push({ name: 'Other', items: otherItems });
  }
  return groups;
};

const SystemMetrics = () => {
  // Use the first record for display (or handle multiple if needed)
  const groups = groupMetrics(systemMetrics[0] || {});

  return (
    <div className={styles.container}>
      <h2>System Metrics</h2>
      {groups.map((group, idx) => (
        <div key={idx} className={styles.group}>
          <h3>{group.name}</h3>
          <table className={styles.table}>
            <tbody>
              {group.items.map(([key, value]) => (
                <tr key={key}>
                  <td className={styles.key}>{key}</td>
                  <td className={styles.value}>
                    {Array.isArray(value) ? (
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {value.map((v, i) => (
                          <li key={i}>
                            <pre style={{ margin: 0, fontSize: 13 }}>{JSON.stringify(v, null, 2)}</pre>
                          </li>
                        ))}
                      </ul>
                    ) : typeof value === 'object' && value !== null ? (
                      <pre style={{ margin: 0, fontSize: 13 }}>{JSON.stringify(value, null, 2)}</pre>
                    ) : (
                      String(value)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default SystemMetrics;
