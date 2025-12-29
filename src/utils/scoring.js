import { detectAnomalies } from './anomalyDetection';
import { findRepeatingPatterns, calculatePatternScore } from './patternDetection';

/**
 * محاسبه امتیاز تغییرات قیمت
 * @param {Object} coin - داده‌های کوین
 * @param {Object} filters - فیلترهای کاربر
 * @returns {number} امتیاز (0-100)
 */
export const calculatePriceChangeScore = (coin, filters = {}) => {
  const priceChange = Math.abs(coin.percentChange24h || 0);
  const minuteChange = Math.abs(coin.minuteChange || 0);
  
  // امتیاز بر اساس شدت تغییرات
  let score = 0;
  
  // تغییرات کلی قیمت (حداکثر 40 امتیاز)
  if (priceChange > 50) score += 40;
  else if (priceChange > 30) score += 30;
  else if (priceChange > 20) score += 20;
  else if (priceChange > 10) score += 10;
  
  // تغییرات دقیقه‌ای (حداکثر 30 امتیاز)
  if (minuteChange > 1) score += 30;
  else if (minuteChange > 0.5) score += 20;
  else if (minuteChange > 0.2) score += 10;
  
  return Math.min(score, 100);
};

/**
 * محاسبه امتیاز حجم معاملات
 * @param {Object} coin - داده‌های کوین
 * @param {Object} volumeMetrics - متریک‌های حجم
 * @returns {number} امتیاز (0-100)
 */
export const calculateVolumeScore = (coin, volumeMetrics) => {
  const zScore = Math.abs(coin.volumeZScore || 0);
  
  // امتیاز بر اساس Z-Score حجم
  if (zScore > 3) return 100;
  if (zScore > 2) return 75;
  if (zScore > 1.5) return 50;
  if (zScore > 1) return 25;
  
  return 0;
};

/**
 * محاسبه امتیاز رفتار غیرعادی
 * @param {Object} coin - داده‌های کوین
 * @param {Object} volumeMetrics - متریک‌های حجم
 * @param {Object} priceMetrics - متریک‌های قیمت
 * @param {Object} filters - فیلترهای کاربر
 * @returns {number} امتیاز (0-100)
 */
export const calculateAnomalyScore = (coin, volumeMetrics, priceMetrics, filters = {}) => {
  const anomalyResult = detectAnomalies(coin, volumeMetrics, priceMetrics, filters);
  
  if (!anomalyResult.hasAnomaly) return 0;
  
  let score = 0;
  
  // امتیاز بر اساس severity
  if (anomalyResult.overallSeverity === 'high') score = 80;
  else if (anomalyResult.overallSeverity === 'medium') score = 50;
  else if (anomalyResult.overallSeverity === 'low') score = 25;
  
  // اضافه کردن امتیاز بر اساس Z-Score
  const priceZScore = Math.abs(anomalyResult.priceAnomaly.zScore);
  const volumeZScore = Math.abs(anomalyResult.volumeAnomaly.zScore);
  
  if (priceZScore > 3 || volumeZScore > 3) score = Math.min(score + 20, 100);
  
  return score;
};

/**
 * محاسبه امتیاز کل کوین
 * @param {Object} coin - داده‌های کوین
 * @param {Object} volumeMetrics - متریک‌های حجم
 * @param {Object} priceMetrics - متریک‌های قیمت
 * @param {Object} filters - فیلترهای کاربر
 * @returns {Object} امتیازها و امتیاز کل
 */
export const calculateTotalScore = (coin, volumeMetrics, priceMetrics, filters = {}) => {
  const priceChangeScore = calculatePriceChangeScore(coin, filters);
  const volumeScore = calculateVolumeScore(coin, volumeMetrics);
  const anomalyScore = calculateAnomalyScore(coin, volumeMetrics, priceMetrics, filters);
  
  // محاسبه امتیاز الگو
  const patternResult = findRepeatingPatterns(coin);
  const patternScore = calculatePatternScore(patternResult);
  
  // محاسبه امتیاز کل با وزن‌ها
  // قیمت: 40%, حجم: 30%, غیرعادی: 20%, الگو: 10%
  const totalScore = 
    (priceChangeScore * 0.4) +
    (volumeScore * 0.3) +
    (anomalyScore * 0.2) +
    (patternScore * 0.1);
  
  return {
    totalScore: Math.round(totalScore * 100) / 100,
    priceChangeScore: Math.round(priceChangeScore * 100) / 100,
    volumeScore: Math.round(volumeScore * 100) / 100,
    anomalyScore: Math.round(anomalyScore * 100) / 100,
    patternScore: Math.round(patternScore * 100) / 100,
    patternResult,
  };
};

/**
 * رتبه‌بندی کوین‌ها بر اساس امتیاز
 * @param {Array} coins - آرایه کوین‌ها با امتیاز
 * @returns {Array} کوین‌های رتبه‌بندی شده
 */
export const rankCoins = (coins) => {
  return [...coins]
    .sort((a, b) => {
      const scoreA = a.score?.totalScore || 0;
      const scoreB = b.score?.totalScore || 0;
      return scoreB - scoreA; // نزولی
    })
    .map((coin, index) => ({
      ...coin,
      rank: index + 1,
    }));
};

