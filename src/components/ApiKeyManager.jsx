import { useState, useEffect } from 'react';
import { FiKey, FiEye, FiEyeOff, FiCheck, FiX, FiInfo } from 'react-icons/fi';

const ApiKeyManager = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedKey, setSavedKey] = useState('');
  const [status, setStatus] = useState(''); // 'success', 'error', ''

  useEffect(() => {
    // بارگذاری API Key از localStorage
    const storedKey = localStorage.getItem('coinmarketcap_api_key') || '';
    setSavedKey(storedKey);
    if (storedKey) {
      setApiKey(storedKey);
      if (onApiKeyChange) {
        onApiKeyChange(storedKey);
      }
    }
  }, [onApiKeyChange]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setStatus('error');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    // ذخیره در localStorage
    localStorage.setItem('coinmarketcap_api_key', apiKey.trim());
    setSavedKey(apiKey.trim());
    setIsEditing(false);
    setStatus('success');
    
    // اطلاع به parent component
    if (onApiKeyChange) {
      onApiKeyChange(apiKey.trim());
    }

    setTimeout(() => setStatus(''), 3000);
  };

  const handleCancel = () => {
    setApiKey(savedKey);
    setIsEditing(false);
    setStatus('');
  };

  const handleDelete = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید API Key را حذف کنید؟')) {
      localStorage.removeItem('coinmarketcap_api_key');
      setApiKey('');
      setSavedKey('');
      setIsEditing(false);
      setStatus('');
      
      if (onApiKeyChange) {
        onApiKeyChange('');
      }
    }
  };

  const maskKey = (key) => {
    if (!key) return '';
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiKey className="text-blue-400 text-xl" />
          <h3 className="text-lg font-semibold text-white">مدیریت API Key</h3>
        </div>
        {savedKey && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            تغییر
          </button>
        )}
      </div>

      {status === 'success' && (
        <div className="mb-3 p-2 bg-green-900/50 border border-green-500 rounded text-green-200 text-sm flex items-center gap-2">
          <FiCheck />
          API Key با موفقیت ذخیره شد
        </div>
      )}

      {status === 'error' && (
        <div className="mb-3 p-2 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm flex items-center gap-2">
          <FiX />
          لطفاً یک API Key معتبر وارد کنید
        </div>
      )}

      {!isEditing && savedKey ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={savedKey}
              readOnly
              className="flex-1 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded border border-slate-600 transition-colors"
            >
              {showKey ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
          >
            حذف API Key
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CoinMarketCap API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key خود را وارد کنید..."
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="bg-blue-900/30 border border-blue-500/50 rounded p-3 text-sm text-blue-200">
            <div className="flex items-start gap-2">
              <FiInfo className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">نحوه دریافت API Key:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>به <a href="https://coinmarketcap.com/api/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">coinmarketcap.com/api</a> بروید</li>
                  <li>ثبت‌نام یا ورود کنید</li>
                  <li>API Key خود را کپی و در اینجا وارد کنید</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FiCheck />
              ذخیره
            </button>
            {savedKey && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors flex items-center gap-2"
              >
                <FiX />
                انصراف
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;

