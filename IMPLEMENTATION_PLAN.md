# برنامه پیاده‌سازی CoinFinder

## مراحل پیاده‌سازی

### مرحله 1: راه‌اندازی پروژه
- ایجاد پروژه React با Vite
- نصب وابستگی‌ها: React, React-DOM, Axios, Recharts, Tailwind CSS, React Icons
- تنظیم ساختار پوشه‌ها
- ایجاد فایل `.env` برای API Key

### مرحله 2: اتصال به CoinMarketCap API
- ایجاد سرویس API (`src/services/api.js`)
- پیاده‌سازی توابع دریافت داده:
  - `fetchTopCryptocurrencies(limit)` - دریافت لیست کوین‌ها
  - `fetchCoinData(coinId)` - دریافت جزئیات یک کوین
- مدیریت API Key و Headers
- مدیریت Rate Limiting و Error Handling

### مرحله 3: پردازش و نرمال‌سازی داده
- ایجاد `src/services/dataProcessor.js`
- توابع:
  - `normalizePriceData(data)` - نرمال‌سازی قیمت‌ها
  - `calculatePriceChanges(data)` - محاسبه تغییرات قیمت
  - `calculateVolumeMetrics(data)` - محاسبه متریک‌های حجم
  - `createDataset(coins)` - ساخت دیتاست یکپارچه

### مرحله 4: الگوریتم‌های تحلیل
- ایجاد `src/utils/anomalyDetection.js`:
  - `detectPriceAnomalies(coinData)` - شناسایی نوسانات غیرعادی قیمت
  - `detectVolumeAnomalies(coinData)` - شناسایی حجم غیرعادی
  - `calculateZScore(value, mean, stdDev)` - محاسبه Z-Score
  
- ایجاد `src/utils/patternDetection.js`:
  - `findRepeatingPatterns(data)` - یافتن الگوهای تکرار شونده
  - `detectSpikePatterns(priceHistory)` - شناسایی الگوهای اسپایک

### مرحله 5: سیستم امتیازدهی
- ایجاد `src/utils/scoring.js`:
  - `calculateAnomalyScore(coin)` - محاسبه امتیاز بر اساس رفتار غیرعادی
  - `calculatePriceChangeScore(priceChange)` - امتیاز تغییرات قیمت
  - `calculateVolumeScore(volume)` - امتیاز حجم
  - `calculateTotalScore(coin)` - امتیاز نهایی
  - `rankCoins(coins)` - رتبه‌بندی کوین‌ها

### مرحله 6: React Hooks
- ایجاد `src/hooks/useCoinData.js`:
  - مدیریت state داده‌های کوین‌ها
  - Fetching و caching داده‌ها
  - به‌روزرسانی دوره‌ای
  
- ایجاد `src/hooks/useFilters.js`:
  - مدیریت فیلترها (بگ‌ها)
  - اعمال فیلترها روی داده‌ها

### مرحله 7: کامپوننت‌های UI

#### 7.1 Settings Panel (`src/components/SettingsPanel.jsx`)
- Input برای درصد تغییرات قیمت در دقیقه (min/max)
- Input برای حداقل حجم معاملات
- Input برای درصد تغییرات قیمت کلی (min/max)
- دکمه اعمال تنظیمات

#### 7.2 Coin Table (`src/components/CoinTable.jsx`)
- جدول با ستون‌ها: رتبه، نام، نماد، قیمت، حجم، تغییرات، امتیاز
- قابلیت مرتب‌سازی بر اساس هر ستون
- Highlight کردن کوین‌های با امتیاز بالا
- Pagination برای نمایش 2000 کوین

#### 7.3 Price Chart (`src/components/PriceChart.jsx`)
- نمودار خطی قیمت با Recharts
- نمایش برای کوین انتخاب شده
- Timeline قابل تنظیم

#### 7.4 Volume Chart (`src/components/VolumeChart.jsx`)
- نمودار میله‌ای حجم معاملات
- نمایش برای کوین انتخاب شده

#### 7.5 Coin Card (`src/components/CoinCard.jsx`)
- کارت نمایش اطلاعات یک کوین
- نمایش خلاصه: نام، قیمت، تغییرات، امتیاز

### مرحله 8: کامپوننت اصلی App
- ایجاد `src/App.jsx`:
  - Layout اصلی
  - یکپارچه‌سازی تمام کامپوننت‌ها
  - مدیریت State کلی
  - نمایش Loading و Error states

### مرحله 9: Styling و UI/UX
- تنظیم Tailwind CSS
- طراحی Responsive
- اضافه کردن انیمیشن‌ها
- رنگ‌بندی بر اساس امتیاز (سبز/قرمز)

### مرحله 10: بهینه‌سازی و تست
- بهینه‌سازی Performance
- اضافه کردن Caching
- تست Error Handling
- تست Responsive Design

## ساختار فایل‌های نهایی

```
CoinFinder/
├── .env                          # API Key (gitignored)
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
├── public/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── CoinTable.jsx
    │   ├── PriceChart.jsx
    │   ├── VolumeChart.jsx
    │   ├── SettingsPanel.jsx
    │   └── CoinCard.jsx
    ├── services/
    │   ├── api.js
    │   └── dataProcessor.js
    ├── utils/
    │   ├── scoring.js
    │   ├── anomalyDetection.js
    │   └── patternDetection.js
    └── hooks/
        ├── useCoinData.js
        └── useFilters.js
```

## جزئیات فنی

### API Endpoints مورد استفاده
- `/v1/cryptocurrency/listings/latest` - لیست کوین‌ها با قیمت و حجم
- `/v1/cryptocurrency/quotes/latest` - جزئیات یک کوین

### فرمول امتیازدهی پیشنهادی
```
Total Score = 
  (Price Anomaly Score × 0.4) +
  (Volume Anomaly Score × 0.3) +
  (Price Change Score × 0.2) +
  (Pattern Score × 0.1)
```

### فیلترهای پیشنهادی (مقادیر پیش‌فرض)
- تغییرات قیمت در دقیقه: -10% تا +10%
- حداقل حجم معاملات: $1,000,000
- تغییرات قیمت کلی: -50% تا +50%

## Timeline تخمینی
- مرحله 1-2: 30 دقیقه
- مرحله 3-5: 1 ساعت
- مرحله 6-7: 1.5 ساعت
- مرحله 8-10: 1 ساعت
**مجموع: ~4 ساعت**

