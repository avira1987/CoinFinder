import { useState, useEffect } from 'react';
import requestLogger from '../services/requestLogger';

/**
 * Hook برای استفاده از Request Logger
 */
export const useRequestLogger = () => {
  const [logs, setLogs] = useState(requestLogger.getLogs());
  const [stats, setStats] = useState(requestLogger.getStats());

  useEffect(() => {
    // Subscribe به تغییرات لاگ‌ها
    const unsubscribe = requestLogger.subscribe((newLogs) => {
      setLogs([...newLogs]);
      setStats(requestLogger.getStats());
    });

    return unsubscribe;
  }, []);

  const clearLogs = () => {
    requestLogger.clearLogs();
  };

  const getFilteredLogs = (filter) => {
    return requestLogger.getFilteredLogs(filter);
  };

  return {
    logs,
    stats,
    clearLogs,
    getFilteredLogs,
  };
};

