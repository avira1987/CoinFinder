import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchTopCryptocurrencies } from '../services/api';
import { createDataset } from '../services/dataProcessor';
import { calculateTotalScore } from '../utils/scoring';
import { rankCoins } from '../utils/scoring';

// ثابت‌ها
const REFETCH_INTERVAL = 5 * 60 * 1000; // 5 دقیقه
const DEFAULT_LIMIT = 500;

/**
 * اعمال فیلترها بر روی کوین‌ها
 */
const applyFilters = (coins, filters) => {
  if (!filters || Object.keys(filters).length === 0) {
    return coins;
  }

  return coins.filter(coin => {
    // فیلتر حجم
    if (filters.minVolume !== undefined && filters.minVolume > 0) {
      if (coin.volume24h < filters.minVolume) return false;
    }

    // فیلتر تغییرات قیمت
    if (filters.minPriceChange !== undefined) {
      if (coin.percentChange24h < filters.minPriceChange) return false;
    }

    if (filters.maxPriceChange !== undefined) {
      if (coin.percentChange24h > filters.maxPriceChange) return false;
    }

    // فیلتر تغییرات دقیقه‌ای
    if (filters.minPriceChangePerMinute !== undefined) {
      if (coin.minuteChange < filters.minPriceChangePerMinute) return false;
    }

    if (filters.maxPriceChangePerMinute !== undefined) {
      if (coin.minuteChange > filters.maxPriceChangePerMinute) return false;
    }

    return true;
  });
};

/**
 * Hook بهینه‌شده برای مدیریت داده‌های کوین‌ها
 */
export const useCoinData = (filters = {}, limit = DEFAULT_LIMIT) => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // استفاده از ref برای جلوگیری از race conditions
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const intervalRef = useRef(null);

  /**
   * تابع اصلی دریافت و پردازش داده‌ها
   */
  const fetchData = useCallback(async () => {
    // جلوگیری از fetch همزمان
    if (isFetchingRef.current) {
      return;
    }

    // لغو درخواست قبلی در صورت وجود
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // ایجاد AbortController جدید
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // دریافت داده‌های خام از API
      const rawData = await fetchTopCryptocurrencies(limit);
      
      // بررسی لغو شدن درخواست
      if (signal.aborted) {
        return;
      }

      // پردازش و نرمال‌سازی داده‌ها
      const dataset = createDataset(rawData);
      
      if (!dataset || dataset.length === 0) {
        throw new Error('داده‌ای دریافت نشد');
      }

      // استخراج متریک‌ها از اولین کوین (همه کوین‌ها متریک یکسان دارند)
      const volumeMetrics = dataset[0]?.volumeMetrics || {};
      const priceMetrics = dataset[0]?.priceMetrics || {};

      // محاسبه امتیاز برای تمام کوین‌ها
      // استفاده از map برای بهینه‌سازی عملکرد
      const coinsWithScores = dataset.map(coin => ({
        ...coin,
        score: calculateTotalScore(coin, volumeMetrics, priceMetrics, filters),
      }));

      // بررسی مجدد لغو شدن درخواست
      if (signal.aborted) {
        return;
      }

      // به‌روزرسانی state
      setCoins(coinsWithScores);
      setLastUpdate(new Date());
    } catch (err) {
      // نادیده گرفتن خطای AbortError
      if (err.name === 'AbortError' || signal.aborted) {
        return;
      }

      console.error('Error fetching coin data:', err);
      setError(err.message || 'خطا در دریافت داده‌ها');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [limit, filters]);

  /**
   * شروع پایش
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    // اجرای اولیه
    fetchData();
    
    // تنظیم interval برای به‌روزرسانی خودکار
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (!isFetchingRef.current) {
        fetchData();
      }
    }, REFETCH_INTERVAL);
  }, [isMonitoring, fetchData]);

  /**
   * توقف موقت پایش
   */
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    // پاک کردن interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * پایان پایش و پاکسازی کامل
   */
  const endMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    // پاک کردن interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // لغو درخواست در حال انجام
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // پاک کردن داده‌ها
    setCoins([]);
    setError(null);
    setLastUpdate(null);
  }, []);

  /**
   * Cleanup در صورت unmount شدن
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // لغو درخواست در حال انجام در صورت unmount شدن
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * محاسبه rankedCoins با useMemo برای بهینه‌سازی
   */
  const rankedCoins = useMemo(() => {
    if (coins.length === 0) return [];
    
    const filtered = applyFilters(coins, filters);
    return rankCoins(filtered);
  }, [coins, filters]);

  return {
    coins,
    rankedCoins,
    loading,
    error,
    lastUpdate,
    isMonitoring,
    refetch: fetchData,
    startMonitoring,
    stopMonitoring,
    endMonitoring,
  };
};
