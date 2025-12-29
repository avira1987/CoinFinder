import { useState } from 'react';
import { useCoinData } from './hooks/useCoinData';
import { useFilters } from './hooks/useFilters';
import SettingsPanel from './components/SettingsPanel';
import CoinTable from './components/CoinTable';
import PriceChart from './components/PriceChart';
import VolumeChart from './components/VolumeChart';
import CoinCard from './components/CoinCard';
import { FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { refreshApiClient } from './services/api';

function App() {
  const { filters, updateFilters, resetFilters } = useFilters();
  const { rankedCoins, loading, error, lastUpdate, refetch } = useCoinData(filters, 500);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [apiKeyChanged, setApiKeyChanged] = useState(0);

  const handleFiltersChange = (newFilters) => {
    updateFilters(newFilters);
  };

  const handleApiKeyChange = (newApiKey) => {
    // به‌روزرسانی API client
    refreshApiClient();
    // فورس رفرش برای دریافت مجدد داده‌ها
    setApiKeyChanged(prev => prev + 1);
    // اگر داده‌ها در حال بارگذاری نیستند، دوباره fetch کنیم
    setTimeout(() => {
      if (refetch) {
        refetch();
      }
    }, 100);
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CoinFinder
          </h1>
          <p className="text-center text-gray-400">
            سیستم تحلیل و رتبه‌بندی رمزارزها بر اساس رفتار غیرعادی
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              به‌روزرسانی
            </button>
            {lastUpdate && (
              <div className="text-sm text-gray-400">
                آخرین به‌روزرسانی: {formatTime(lastUpdate)}
              </div>
            )}
          </div>
        </header>

        {/* Settings Panel */}
        <SettingsPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={resetFilters}
          onApiKeyChange={handleApiKeyChange}
        />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-2">
            <FiAlertCircle className="text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">در حال دریافت داده‌ها...</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="text-sm text-gray-400">تعداد کوین‌ها</div>
                <div className="text-2xl font-bold text-white">{rankedCoins.length}</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="text-sm text-gray-400">کوین‌های با امتیاز بالا</div>
                <div className="text-2xl font-bold text-orange-400">
                  {rankedCoins.filter(c => (c.score?.totalScore || 0) >= 50).length}
                </div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="text-sm text-gray-400">میانگین امتیاز</div>
                <div className="text-2xl font-bold text-blue-400">
                  {rankedCoins.length > 0
                    ? (rankedCoins.reduce((sum, c) => sum + (c.score?.totalScore || 0), 0) / rankedCoins.length).toFixed(1)
                    : '0.0'}
                </div>
              </div>
            </div>

            {/* Selected Coin Card */}
            {selectedCoin && (
              <div className="mb-6">
                <CoinCard coin={selectedCoin} />
              </div>
            )}

            {/* Charts */}
            {selectedCoin && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <PriceChart coin={selectedCoin} />
                <VolumeChart coin={selectedCoin} />
              </div>
            )}

            {/* Coin Table */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">جدول رتبه‌بندی کوین‌ها</h2>
              <CoinTable coins={rankedCoins} onCoinSelect={setSelectedCoin} />
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>CoinFinder - تحلیل و رتبه‌بندی رمزارزها با استفاده از CoinMarketCap API</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

