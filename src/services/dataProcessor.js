/**
 * نرمال‌سازی و پردازش داده‌های کوین‌ها
 */

/**
 * نرمال‌سازی داده‌های قیمت
 * @param {Array} coins - آرایه کوین‌ها از API
 * @returns {Array} داده‌های نرمال‌سازی شده
 */
export const normalizePriceData = (coins) => {
  if (!coins || !Array.isArray(coins)) return [];
  
  return coins.map(coin => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    price: coin.quote?.USD?.price || 0,
    marketCap: coin.quote?.USD?.market_cap || 0,
    volume24h: coin.quote?.USD?.volume_24h || 0,
    volumeChange24h: coin.quote?.USD?.volume_change_24h || 0,
    percentChange1h: coin.quote?.USD?.percent_change_1h || 0,
    percentChange24h: coin.quote?.USD?.percent_change_24h || 0,
    percentChange7d: coin.quote?.USD?.percent_change_7d || 0,
    circulatingSupply: coin.circulating_supply || 0,
    totalSupply: coin.total_supply || 0,
    cmcRank: coin.cmc_rank || 0,
    lastUpdated: coin.quote?.USD?.last_updated || new Date().toISOString(),
  }));
};

/**
 * محاسبه تغییرات قیمت در دقیقه (تقریبی)
 * از آنجایی که API تغییرات دقیقه‌ای مستقیم ندارد، از تغییرات ساعتی تقریب می‌زنیم
 * @param {number} percentChange1h - تغییرات درصدی در یک ساعت
 * @returns {number} تغییرات تقریبی در دقیقه
 */
export const calculateMinuteChange = (percentChange1h) => {
  // تقسیم تغییرات ساعتی بر 60 برای تقریب دقیقه‌ای
  return percentChange1h / 60;
};

/**
 * محاسبه متریک‌های حجم
 * @param {Array} coins - آرایه کوین‌ها
 * @returns {Object} متریک‌های حجم
 */
export const calculateVolumeMetrics = (coins) => {
  if (!coins || coins.length === 0) {
    return {
      average: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
    };
  }
  
  const volumes = coins
    .map(coin => coin.volume24h)
    .filter(vol => vol > 0)
    .sort((a, b) => a - b);
  
  if (volumes.length === 0) {
    return {
      average: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
    };
  }
  
  const average = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
  const median = volumes.length % 2 === 0
    ? (volumes[volumes.length / 2 - 1] + volumes[volumes.length / 2]) / 2
    : volumes[Math.floor(volumes.length / 2)];
  
  const variance = volumes.reduce((sum, vol) => sum + Math.pow(vol - average, 2), 0) / volumes.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    average,
    median,
    stdDev,
    min: volumes[0],
    max: volumes[volumes.length - 1],
  };
};

/**
 * محاسبه متریک‌های تغییرات قیمت
 * @param {Array} coins - آرایه کوین‌ها
 * @returns {Object} متریک‌های تغییرات
 */
export const calculatePriceChangeMetrics = (coins) => {
  if (!coins || coins.length === 0) {
    return {
      average: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
    };
  }
  
  const changes = coins
    .map(coin => coin.percentChange24h)
    .filter(change => !isNaN(change))
    .sort((a, b) => a - b);
  
  if (changes.length === 0) {
    return {
      average: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
    };
  }
  
  const average = changes.reduce((sum, change) => sum + change, 0) / changes.length;
  const median = changes.length % 2 === 0
    ? (changes[changes.length / 2 - 1] + changes[changes.length / 2]) / 2
    : changes[Math.floor(changes.length / 2)];
  
  const variance = changes.reduce((sum, change) => sum + Math.pow(change - average, 2), 0) / changes.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    average,
    median,
    stdDev,
    min: changes[0],
    max: changes[changes.length - 1],
  };
};

/**
 * ساخت دیتاست یکپارچه برای تحلیل
 * @param {Array} coins - آرایه کوین‌های نرمال‌سازی شده
 * @returns {Array} دیتاست کامل با متریک‌ها
 */
export const createDataset = (coins) => {
  const normalized = normalizePriceData(coins);
  const volumeMetrics = calculateVolumeMetrics(normalized);
  const priceMetrics = calculatePriceChangeMetrics(normalized);
  
  return normalized.map(coin => ({
    ...coin,
    minuteChange: calculateMinuteChange(coin.percentChange1h),
    volumeZScore: volumeMetrics.stdDev > 0 
      ? (coin.volume24h - volumeMetrics.average) / volumeMetrics.stdDev 
      : 0,
    priceChangeZScore: priceMetrics.stdDev > 0
      ? (coin.percentChange24h - priceMetrics.average) / priceMetrics.stdDev
      : 0,
    volumeMetrics,
    priceMetrics,
  }));
};

