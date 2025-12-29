/**
 * شناسایی رفتارهای غیرعادی در داده‌های کوین‌ها
 */

/**
 * محاسبه Z-Score
 * @param {number} value - مقدار
 * @param {number} mean - میانگین
 * @param {number} stdDev - انحراف معیار
 * @returns {number} Z-Score
 */
export const calculateZScore = (value, mean, stdDev) => {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
};

/**
 * شناسایی نوسانات غیرعادی قیمت
 * @param {Object} coin - داده‌های کوین
 * @param {Object} metrics - متریک‌های قیمت
 * @param {number} threshold - آستانه Z-Score (پیش‌فرض: 2)
 * @returns {Object} نتیجه تحلیل
 */
export const detectPriceAnomalies = (coin, metrics, threshold = 2) => {
  const zScore = Math.abs(coin.priceChangeZScore || 0);
  const isAnomaly = zScore > threshold;
  
  return {
    isAnomaly,
    zScore,
    severity: isAnomaly 
      ? zScore > 3 ? 'high' : zScore > 2 ? 'medium' : 'low'
      : 'normal',
    priceChange: coin.percentChange24h,
    minuteChange: coin.minuteChange,
  };
};

/**
 * شناسایی حجم معاملات غیرعادی
 * @param {Object} coin - داده‌های کوین
 * @param {Object} metrics - متریک‌های حجم
 * @param {number} threshold - آستانه Z-Score (پیش‌فرض: 2)
 * @returns {Object} نتیجه تحلیل
 */
export const detectVolumeAnomalies = (coin, metrics, threshold = 2) => {
  const zScore = Math.abs(coin.volumeZScore || 0);
  const isAnomaly = zScore > threshold;
  
  return {
    isAnomaly,
    zScore,
    severity: isAnomaly
      ? zScore > 3 ? 'high' : zScore > 2 ? 'medium' : 'low'
      : 'normal',
    volume: coin.volume24h,
    volumeChange: coin.volumeChange24h,
  };
};

/**
 * شناسایی تغییرات قیمت غیرعادی در دقیقه
 * @param {Object} coin - داده‌های کوین
 * @param {number} minThreshold - حداقل تغییر (درصد)
 * @param {number} maxThreshold - حداکثر تغییر (درصد)
 * @returns {Object} نتیجه تحلیل
 */
export const detectMinutePriceAnomalies = (coin, minThreshold = -10, maxThreshold = 10) => {
  const minuteChange = coin.minuteChange || 0;
  const isAnomaly = minuteChange < minThreshold || minuteChange > maxThreshold;
  
  return {
    isAnomaly,
    minuteChange,
    threshold: { min: minThreshold, max: maxThreshold },
  };
};

/**
 * تحلیل جامع رفتار غیرعادی
 * @param {Object} coin - داده‌های کوین
 * @param {Object} volumeMetrics - متریک‌های حجم
 * @param {Object} priceMetrics - متریک‌های قیمت
 * @param {Object} filters - فیلترهای کاربر
 * @returns {Object} نتیجه تحلیل کامل
 */
export const detectAnomalies = (coin, volumeMetrics, priceMetrics, filters = {}) => {
  const priceAnomaly = detectPriceAnomalies(coin, priceMetrics);
  const volumeAnomaly = detectVolumeAnomalies(coin, volumeMetrics);
  const minuteAnomaly = detectMinutePriceAnomalies(
    coin,
    filters.minPriceChangePerMinute,
    filters.maxPriceChangePerMinute
  );
  
  const hasAnyAnomaly = priceAnomaly.isAnomaly || volumeAnomaly.isAnomaly || minuteAnomaly.isAnomaly;
  
  return {
    hasAnomaly: hasAnyAnomaly,
    priceAnomaly,
    volumeAnomaly,
    minuteAnomaly,
    overallSeverity: hasAnyAnomaly
      ? priceAnomaly.severity === 'high' || volumeAnomaly.severity === 'high' ? 'high'
      : priceAnomaly.severity === 'medium' || volumeAnomaly.severity === 'medium' ? 'medium'
      : 'low'
      : 'normal',
  };
};

