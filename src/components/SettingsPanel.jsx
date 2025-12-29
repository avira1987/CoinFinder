import { useState } from 'react';
import { FiSettings, FiRefreshCw } from 'react-icons/fi';
import ApiKeyManager from './ApiKeyManager';

const SettingsPanel = ({ filters, onFiltersChange, onReset, onApiKeyChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key, value) => {
    const numValue = parseFloat(value) || 0;
    setLocalFilters(prev => ({
      ...prev,
      [key]: numValue,
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      minPriceChangePerMinute: -10,
      maxPriceChangePerMinute: 10,
      minVolume: 1000000,
      minPriceChange: -50,
      maxPriceChange: 50,
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    if (onReset) onReset();
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
      >
        <FiSettings className="text-xl" />
        <span className="font-semibold">تنظیمات</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-6">
          {/* API Key Management Section */}
          <div className="border-t border-slate-700 pt-4">
            <ApiKeyManager onApiKeyChange={onApiKeyChange} />
          </div>

          {/* Filters Section */}
          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-lg font-semibold text-white mb-4">فیلترها</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* تغییرات قیمت در دقیقه */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                تغییرات قیمت در دقیقه (%)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={localFilters.minPriceChangePerMinute}
                  onChange={(e) => handleChange('minPriceChangePerMinute', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  placeholder="حداقل"
                />
                <span className="self-center text-gray-400">تا</span>
                <input
                  type="number"
                  value={localFilters.maxPriceChangePerMinute}
                  onChange={(e) => handleChange('maxPriceChangePerMinute', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  placeholder="حداکثر"
                />
              </div>
            </div>

            {/* حجم معاملات */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                حداقل حجم معاملات (USD)
              </label>
              <input
                type="number"
                value={localFilters.minVolume}
                onChange={(e) => handleChange('minVolume', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                placeholder="مثال: 1000000"
              />
            </div>

            {/* تغییرات قیمت کلی */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                تغییرات قیمت کلی (%)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={localFilters.minPriceChange}
                  onChange={(e) => handleChange('minPriceChange', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  placeholder="حداقل"
                />
                <span className="self-center text-gray-400">تا</span>
                <input
                  type="number"
                  value={localFilters.maxPriceChange}
                  onChange={(e) => handleChange('maxPriceChange', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none"
                  placeholder="حداکثر"
                />
              </div>
            </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
              >
                اعمال تنظیمات
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors flex items-center gap-2"
              >
                <FiRefreshCw />
                بازنشانی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;

