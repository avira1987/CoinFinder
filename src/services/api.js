import axios from 'axios';
import requestLogger from './requestLogger';

const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

// تابع برای دریافت API Key (اول از localStorage، سپس از .env)
const getApiKey = () => {
  // اول از localStorage بررسی می‌کنیم
  const storedKey = localStorage.getItem('coinmarketcap_api_key');
  if (storedKey) {
    return storedKey;
  }
  // اگر در localStorage نبود، از .env استفاده می‌کنیم
  return import.meta.env.VITE_COINMARKETCAP_API_KEY || '';
};

// ایجاد apiClient با قابلیت به‌روزرسانی header و interceptors
const createApiClient = () => {
  const apiKey = getApiKey();
  
  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      'X-CMC_PRO_API_KEY': apiKey,
      'Accept': 'application/json',
    },
    timeout: 30000, // 30 ثانیه timeout
  });

  // Request interceptor برای ثبت درخواست‌ها
  client.interceptors.request.use(
    (config) => {
      // ثبت زمان شروع برای محاسبه مدت زمان
      config.metadata = { startTime: Date.now() };
      
      // ثبت درخواست در لاگر
      requestLogger.logRequest(config);
      
      return config;
    },
    (error) => {
      requestLogger.logError(error);
      return Promise.reject(error);
    }
  );

  // Response interceptor برای ثبت پاسخ‌ها
  client.interceptors.response.use(
    (response) => {
      // ثبت پاسخ موفق
      requestLogger.logResponse(response);
      return response;
    },
    (error) => {
      // ثبت خطا
      requestLogger.logError(error);
      return Promise.reject(error);
    }
  );

  return client;
};

// تابع برای به‌روزرسانی API Key در client
export const updateApiKey = (newApiKey) => {
  if (newApiKey) {
    localStorage.setItem('coinmarketcap_api_key', newApiKey);
  } else {
    localStorage.removeItem('coinmarketcap_api_key');
  }
};

let apiClient = createApiClient();

// تابع برای ایجاد مجدد client با API Key جدید
export const refreshApiClient = () => {
  apiClient = createApiClient();
};

/**
 * دریافت لیست کوین‌های برتر با قیمت و حجم
 * @param {number} limit - تعداد کوین‌ها (حداکثر 5000)
 * @returns {Promise} داده‌های کوین‌ها
 */
export const fetchTopCryptocurrencies = async (limit = 2000) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API Key تنظیم نشده است. لطفاً API Key خود را در بخش مدیریت API Key وارد کنید.');
    }
    
    // ایجاد client جدید با API Key به‌روز
    const client = createApiClient();
    const response = await client.get('/cryptocurrency/listings/latest', {
      params: {
        start: 1,
        limit: Math.min(limit, 5000),
        convert: 'USD',
        sort: 'market_cap',
      },
    });
    
    if (response.data.status.error_code !== 0) {
      throw new Error(response.data.status.error_message || 'خطا در دریافت داده‌ها');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    if (error.response) {
      // خطای HTTP
      const status = error.response.status;
      const message = error.response.data?.status?.error_message || error.message;
      throw new Error(`خطای API (${status}): ${message}`);
    } else if (error.request) {
      // درخواست ارسال شد اما پاسخی دریافت نشد
      throw new Error('خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.');
    } else {
      // خطای دیگر
      throw error;
    }
  }
};

/**
 * دریافت جزئیات یک کوین خاص
 * @param {string|number} coinId - ID یا symbol کوین
 * @returns {Promise} جزئیات کوین
 */
export const fetchCoinDetails = async (coinId) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API Key تنظیم نشده است.');
    }
    
    const client = createApiClient();
    const response = await client.get('/cryptocurrency/quotes/latest', {
      params: {
        id: coinId,
        convert: 'USD',
      },
    });
    
    return response.data.data[coinId];
  } catch (error) {
    console.error('Error fetching coin details:', error);
    throw error;
  }
};

/**
 * دریافت داده‌های تاریخی قیمت (اگر API پشتیبانی کند)
 * @param {string|number} coinId - ID کوین
 * @param {number} days - تعداد روزها
 * @returns {Promise} داده‌های تاریخی
 */
export const fetchHistoricalData = async (coinId, days = 7) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return null;
    }
    
    const client = createApiClient();
    const response = await client.get('/cryptocurrency/quotes/historical', {
      params: {
        id: coinId,
        convert: 'USD',
        count: days,
        interval: 'daily',
      },
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    // اگر این endpoint در پلن رایگان موجود نباشد، null برمی‌گردانیم
    return null;
  }
};

export default apiClient;
export { getApiKey };

