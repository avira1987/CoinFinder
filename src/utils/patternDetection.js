/**
 * شناسایی الگوهای تکرار شونده در داده‌های کوین‌ها
 */

/**
 * شناسایی الگوهای اسپایک قیمت
 * @param {Object} coin - داده‌های کوین
 * @returns {Object} نتیجه شناسایی الگو
 */
export const detectSpikePatterns = (coin) => {
  const priceChange = coin.percentChange24h || 0;
  const volumeChange = coin.volumeChange24h || 0;
  
  // الگوی اسپایک: تغییر قیمت شدید همراه با افزایش حجم
  const isSpike = Math.abs(priceChange) > 10 && volumeChange > 50;
  
  return {
    isSpike,
    pattern: isSpike ? 'spike' : 'normal',
    confidence: isSpike ? Math.min(Math.abs(priceChange) / 20, 1) : 0,
  };
};

/**
 * شناسایی الگوهای پامپ و دامپ
 * @param {Object} coin - داده‌های کوین
 * @returns {Object} نتیجه شناسایی الگو
 */
export const detectPumpDumpPatterns = (coin) => {
  const priceChange = coin.percentChange24h || 0;
  const volumeChange = coin.volumeChange24h || 0;
  const hourChange = coin.percentChange1h || 0;
  
  // الگوی پامپ: افزایش شدید قیمت با حجم بالا
  const isPump = priceChange > 20 && volumeChange > 100 && hourChange > 5;
  
  // الگوی دامپ: کاهش شدید قیمت با حجم بالا
  const isDump = priceChange < -20 && volumeChange > 100 && hourChange < -5;
  
  return {
    isPump,
    isDump,
    pattern: isPump ? 'pump' : isDump ? 'dump' : 'normal',
    confidence: isPump || isDump 
      ? Math.min(Math.abs(priceChange) / 30, 1) 
      : 0,
  };
};

/**
 * شناسایی الگوهای تکرار شونده مشکوک
 * @param {Object} coin - داده‌های کوین
 * @param {Array} historicalData - داده‌های تاریخی (اگر موجود باشد)
 * @returns {Object} نتیجه شناسایی الگو
 */
export const findRepeatingPatterns = (coin, historicalData = null) => {
  // اگر داده‌های تاریخی موجود نباشد، از داده‌های فعلی استفاده می‌کنیم
  const spikePattern = detectSpikePatterns(coin);
  const pumpDumpPattern = detectPumpDumpPatterns(coin);
  
  // ترکیب الگوها
  const suspiciousPatterns = [];
  if (spikePattern.isSpike) suspiciousPatterns.push('spike');
  if (pumpDumpPattern.isPump) suspiciousPatterns.push('pump');
  if (pumpDumpPattern.isDump) suspiciousPatterns.push('dump');
  
  const hasSuspiciousPattern = suspiciousPatterns.length > 0;
  const maxConfidence = Math.max(
    spikePattern.confidence,
    pumpDumpPattern.confidence
  );
  
  return {
    hasPattern: hasSuspiciousPattern,
    patterns: suspiciousPatterns,
    confidence: maxConfidence,
    details: {
      spike: spikePattern,
      pumpDump: pumpDumpPattern,
    },
  };
};

/**
 * محاسبه امتیاز الگو
 * @param {Object} patternResult - نتیجه شناسایی الگو
 * @returns {number} امتیاز الگو (0-100)
 */
export const calculatePatternScore = (patternResult) => {
  if (!patternResult.hasPattern) return 0;
  
  // امتیاز بر اساس تعداد الگوهای مشکوک و confidence
  const patternCount = patternResult.patterns.length;
  const baseScore = patternCount * 30; // 30 امتیاز برای هر الگو
  const confidenceBonus = patternResult.confidence * 20; // تا 20 امتیاز اضافی
  
  return Math.min(baseScore + confidenceBonus, 100);
};

