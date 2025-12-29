/**
 * سرویس لاگر برای ردیابی درخواست‌ها و پاسخ‌های API
 */

class RequestLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100; // حداکثر تعداد لاگ‌های نگهداری شده
    this.listeners = new Set();
  }

  /**
   * اضافه کردن یک لاگ جدید
   * @param {Object} logEntry - اطلاعات لاگ
   */
  addLog(logEntry) {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      ...logEntry,
    };

    this.logs.unshift(entry); // اضافه کردن به ابتدای آرایه

    // محدود کردن تعداد لاگ‌ها
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // اطلاع‌رسانی به listeners
    this.notifyListeners();
  }

  /**
   * ثبت درخواست ارسالی
   */
  logRequest(config) {
    this.addLog({
      type: 'request',
      method: config.method?.toUpperCase() || 'GET',
      url: config.url || config.baseURL,
      fullUrl: config.baseURL ? `${config.baseURL}${config.url}` : config.url,
      params: config.params,
      headers: this.sanitizeHeaders(config.headers),
      status: 'pending',
    });
  }

  /**
   * ثبت پاسخ موفق
   */
  logResponse(response) {
    const config = response.config;
    this.addLog({
      type: 'response',
      method: config.method?.toUpperCase() || 'GET',
      url: config.url || config.baseURL,
      fullUrl: config.baseURL ? `${config.baseURL}${config.url}` : config.url,
      status: response.status,
      statusText: response.statusText,
      dataSize: JSON.stringify(response.data).length,
      duration: response.config.metadata?.startTime 
        ? Date.now() - response.config.metadata.startTime 
        : null,
      timestamp: new Date(),
    });
  }

  /**
   * ثبت خطا
   */
  logError(error) {
    const config = error.config || {};
    const response = error.response;
    
    this.addLog({
      type: 'error',
      method: config.method?.toUpperCase() || 'GET',
      url: config.url || config.baseURL,
      fullUrl: config.baseURL ? `${config.baseURL}${config.url}` : config.url,
      status: response?.status || 'N/A',
      statusText: response?.statusText || error.message,
      errorMessage: error.message,
      errorData: response?.data,
      duration: config.metadata?.startTime 
        ? Date.now() - config.metadata.startTime 
        : null,
      timestamp: new Date(),
    });
  }

  /**
   * پاک کردن اطلاعات حساس از headers
   */
  sanitizeHeaders(headers) {
    if (!headers) return {};
    
    const sanitized = { ...headers };
    const sensitiveKeys = ['x-cmc_pro_api_key', 'authorization', 'api-key'];
    
    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '***';
      }
    });
    
    return sanitized;
  }

  /**
   * دریافت تمام لاگ‌ها
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * دریافت لاگ‌های فیلتر شده
   */
  getFilteredLogs(filter = {}) {
    let filtered = [...this.logs];

    if (filter.type) {
      filtered = filtered.filter(log => log.type === filter.type);
    }

    if (filter.method) {
      filtered = filtered.filter(log => 
        log.method?.toUpperCase() === filter.method.toUpperCase()
      );
    }

    if (filter.status) {
      filtered = filtered.filter(log => {
        if (filter.status === 'success') {
          return log.type === 'response' && log.status >= 200 && log.status < 300;
        }
        if (filter.status === 'error') {
          return log.type === 'error' || (log.status >= 400);
        }
        return true;
      });
    }

    return filtered;
  }

  /**
   * پاک کردن تمام لاگ‌ها
   */
  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  /**
   * ثبت listener برای تغییرات
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * اطلاع‌رسانی به listeners
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.logs);
      } catch (error) {
        console.error('Error in log listener:', error);
      }
    });
  }

  /**
   * دریافت آمار لاگ‌ها
   */
  getStats() {
    const total = this.logs.length;
    const requests = this.logs.filter(log => log.type === 'request').length;
    const responses = this.logs.filter(log => log.type === 'response').length;
    const errors = this.logs.filter(log => log.type === 'error').length;
    const successRate = responses > 0 
      ? ((responses - errors) / responses * 100).toFixed(1) 
      : 0;

    return {
      total,
      requests,
      responses,
      errors,
      successRate,
    };
  }
}

// ایجاد instance یکتا
const requestLogger = new RequestLogger();

export default requestLogger;

