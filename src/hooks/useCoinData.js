import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTopCryptocurrencies } from '../services/api';
import { createDataset } from '../services/dataProcessor';
import { calculateTotalScore } from '../utils/scoring';
import { rankCoins } from '../utils/scoring';

/**
 * Hook برای مدیریت داده‌های کوین‌ها
 */
export const useCoinData = (filters = {}, limit = 500) => {
  const [coins, setCoins] = useState([]);
  const [rankedCoins, setRankedCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // استفاده از ref برای جلوگیری از re-render های غیرضروری
  const filtersRef = useRef(filters);
  const limitRef = useRef(limit);
  const intervalIdRef = useRef(null);
  const isFetchingRef = useRef(false);
  
  // به‌روزرسانی ref ها
  useEffect(() => {
    filtersRef.current = filters;
    limitRef.current = limit;
  }, [filters, limit]);

  // استفاده از ref برای ردیابی فیلترهای قبلی
  const prevFiltersRef = useRef(null);

  const fetchData = useCallback(async () => {
    // جلوگیری از fetch همزمان
    if (isFetchingRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const currentLimit = limitRef.current;
      const currentFilters = filtersRef.current;
      
      // دریافت داده‌ها از API
      const rawData = await fetchTopCryptocurrencies(currentLimit);
      
      // پردازش و نرمال‌سازی
      const dataset = createDataset(rawData);
      
      if (!dataset || dataset.length === 0) {
        throw new Error('داده‌ای دریافت نشد');
      }
      
      // محاسبه متریک‌ها
      const volumeMetrics = dataset[0]?.volumeMetrics || {};
      const priceMetrics = dataset[0]?.priceMetrics || {};
      
      // پردازش به صورت batch برای جلوگیری از هنگ مرورگر
      const BATCH_SIZE = 50;
      const coinsWithScores = [];
      
      for (let i = 0; i < dataset.length; i += BATCH_SIZE) {
        const batch = dataset.slice(i, i + BATCH_SIZE);
        
        // پردازش batch
        const batchResults = batch.map(coin => ({
          ...coin,
          score: calculateTotalScore(coin, volumeMetrics, priceMetrics, currentFilters),
        }));
        
        coinsWithScores.push(...batchResults);
        
        // اجازه دادن به مرورگر برای render و جلوگیری از هنگ
        if (i + BATCH_SIZE < dataset.length) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      // اعمال فیلترها
      let filteredCoins = coinsWithScores;
      
      if (currentFilters.minVolume !== undefined && currentFilters.minVolume > 0) {
        filteredCoins = filteredCoins.filter(coin => coin.volume24h >= currentFilters.minVolume);
      }
      
      if (currentFilters.minPriceChange !== undefined) {
        filteredCoins = filteredCoins.filter(
          coin => coin.percentChange24h >= currentFilters.minPriceChange
        );
      }
      
      if (currentFilters.maxPriceChange !== undefined) {
        filteredCoins = filteredCoins.filter(
          coin => coin.percentChange24h <= currentFilters.maxPriceChange
        );
      }
      
      if (currentFilters.minPriceChangePerMinute !== undefined) {
        filteredCoins = filteredCoins.filter(
          coin => coin.minuteChange >= currentFilters.minPriceChangePerMinute
        );
      }
      
      if (currentFilters.maxPriceChangePerMinute !== undefined) {
        filteredCoins = filteredCoins.filter(
          coin => coin.minuteChange <= currentFilters.maxPriceChangePerMinute
        );
      }
      
      // رتبه‌بندی
      const ranked = rankCoins(filteredCoins);
      
      setCoins(coinsWithScores);
      setRankedCoins(ranked);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching coin data:', err);
      setError(err.message || 'خطا در دریافت داده‌ها');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []); // بدون وابستگی - همیشه از ref ها استفاده می‌کند

  // useEffect واحد برای مدیریت fetch و interval
  useEffect(() => {
    let isMounted = true;
    
    // بررسی تغییر فیلترها
    const filtersChanged = !prevFiltersRef.current || 
      prevFiltersRef.current.minVolume !== filters.minVolume ||
      prevFiltersRef.current.minPriceChange !== filters.minPriceChange ||
      prevFiltersRef.current.maxPriceChange !== filters.maxPriceChange ||
      prevFiltersRef.current.minPriceChangePerMinute !== filters.minPriceChangePerMinute ||
      prevFiltersRef.current.maxPriceChangePerMinute !== filters.maxPriceChangePerMinute;
    
    // ذخیره فیلترهای فعلی
    prevFiltersRef.current = { ...filters };
    
    // پاک کردن interval قبلی اگر وجود داشت
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    
    const executeFetch = async () => {
      if (isMounted && !isFetchingRef.current) {
        await fetchData();
      }
    };
    
    // اجرای اولیه یا در صورت تغییر فیلترها
    if (filtersChanged) {
      executeFetch();
    }
    
    // به‌روزرسانی خودکار هر 5 دقیقه
    intervalIdRef.current = setInterval(() => {
      if (isMounted && !isFetchingRef.current) {
        executeFetch();
      }
    }, 5 * 60 * 1000);
    
    return () => {
      isMounted = false;
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [
    filters.minVolume,
    filters.minPriceChange,
    filters.maxPriceChange,
    filters.minPriceChangePerMinute,
    filters.maxPriceChangePerMinute,
    fetchData
  ]);

  return {
    coins,
    rankedCoins,
    loading,
    error,
    lastUpdate,
    refetch: fetchData,
  };
};

