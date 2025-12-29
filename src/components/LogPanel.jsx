import { useState, useMemo } from 'react';
import { useRequestLogger } from '../hooks/useRequestLogger';
import { FiX, FiTrash2, FiFilter, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

const LogPanel = ({ isOpen, onClose }) => {
  const { logs, stats, clearLogs } = useRequestLogger();
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (filter.type) {
      filtered = filtered.filter(log => log.type === filter.type);
    }

    if (filter.status === 'success') {
      filtered = filtered.filter(log => 
        log.type === 'response' && log.status >= 200 && log.status < 300
      );
    } else if (filter.status === 'error') {
      filtered = filtered.filter(log => 
        log.type === 'error' || (log.status >= 400)
      );
    }

    return filtered;
  }, [logs, filter]);

  const toggleLogExpansion = (logId) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (log) => {
    if (log.type === 'error') return 'text-red-400';
    if (log.type === 'response') {
      if (log.status >= 200 && log.status < 300) return 'text-green-400';
      if (log.status >= 400) return 'text-red-400';
      return 'text-yellow-400';
    }
    if (log.type === 'request') return 'text-blue-400';
    return 'text-gray-400';
  };

  const getStatusIcon = (log) => {
    if (log.type === 'error') return <FiXCircle className="text-red-400" />;
    if (log.type === 'response' && log.status >= 200 && log.status < 300) {
      return <FiCheckCircle className="text-green-400" />;
    }
    if (log.type === 'request') return <FiClock className="text-blue-400" />;
    return <FiXCircle className="text-yellow-400" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">لاگ درخواست‌های API</h2>
            <p className="text-sm text-gray-400 mt-1">
              نمایش تمام درخواست‌ها و پاسخ‌های ارسالی
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <FiX className="text-gray-400 text-xl" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">کل درخواست‌ها</div>
            <div className="text-lg font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">موفق</div>
            <div className="text-lg font-bold text-green-400">{stats.responses - stats.errors}</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">خطا</div>
            <div className="text-lg font-bold text-red-400">{stats.errors}</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">نرخ موفقیت</div>
            <div className="text-lg font-bold text-blue-400">{stats.successRate}%</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <span className="text-sm text-gray-400">فیلتر:</span>
          </div>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="bg-slate-700 text-white rounded-lg px-3 py-1 text-sm border border-slate-600"
          >
            <option value="">همه انواع</option>
            <option value="request">درخواست</option>
            <option value="response">پاسخ</option>
            <option value="error">خطا</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="bg-slate-700 text-white rounded-lg px-3 py-1 text-sm border border-slate-600"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="success">موفق</option>
            <option value="error">خطا</option>
          </select>
          <button
            onClick={clearLogs}
            className="ml-auto flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            <FiTrash2 />
            پاک کردن لاگ‌ها
          </button>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              لاگی برای نمایش وجود ندارد
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogs.has(log.id);
                return (
                  <div
                    key={log.id}
                    className="bg-slate-700/50 rounded-lg p-3 border border-slate-600 hover:border-slate-500 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => toggleLogExpansion(log.id)}
                    >
                      <div className="flex-shrink-0">{getStatusIcon(log)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm font-semibold ${getStatusColor(log)}`}>
                            {log.method || 'GET'}
                          </span>
                          <span className="text-gray-300 text-sm truncate">
                            {log.fullUrl || log.url}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                          <span>{formatTime(log.timestamp)}</span>
                          {log.status && (
                            <span className={getStatusColor(log)}>
                              {log.status} {log.statusText}
                            </span>
                          )}
                          {log.duration && (
                            <span className="text-gray-500">
                              مدت زمان: {formatDuration(log.duration)}
                            </span>
                          )}
                          {log.dataSize && (
                            <span className="text-gray-500">
                              حجم: {(log.dataSize / 1024).toFixed(2)} KB
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-600 space-y-2">
                        {log.params && Object.keys(log.params).length > 0 && (
                          <div>
                            <div className="text-xs text-gray-400 mb-1">پارامترها:</div>
                            <pre className="bg-slate-900 rounded p-2 text-xs text-gray-300 overflow-x-auto">
                              {JSON.stringify(log.params, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.headers && Object.keys(log.headers).length > 0 && (
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Headers:</div>
                            <pre className="bg-slate-900 rounded p-2 text-xs text-gray-300 overflow-x-auto">
                              {JSON.stringify(log.headers, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.errorMessage && (
                          <div>
                            <div className="text-xs text-red-400 mb-1">پیام خطا:</div>
                            <div className="bg-red-900/20 border border-red-500/50 rounded p-2 text-xs text-red-300">
                              {log.errorMessage}
                            </div>
                          </div>
                        )}
                        {log.errorData && (
                          <div>
                            <div className="text-xs text-red-400 mb-1">جزئیات خطا:</div>
                            <pre className="bg-red-900/20 border border-red-500/50 rounded p-2 text-xs text-red-300 overflow-x-auto">
                              {JSON.stringify(log.errorData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogPanel;

