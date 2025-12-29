import { useState, useCallback } from 'react';

/**
 * Hook برای مدیریت فیلترها (بگ‌ها)
 */
export const useFilters = () => {
  const [filters, setFilters] = useState({
    // درصد تغییرات قیمت در دقیقه
    minPriceChangePerMinute: -10,
    maxPriceChangePerMinute: 10,
    
    // حداقل حجم معاملات (USD)
    minVolume: 1000000, // 1 میلیون دلار
    
    // درصد تغییرات قیمت کلی
    minPriceChange: -50,
    maxPriceChange: 50,
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      minPriceChangePerMinute: -10,
      maxPriceChangePerMinute: 10,
      minVolume: 1000000,
      minPriceChange: -50,
      maxPriceChange: 50,
    });
  }, []);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
  };
};

