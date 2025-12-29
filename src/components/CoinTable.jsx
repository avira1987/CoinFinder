import { useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const CoinTable = ({ coins, onCoinSelect }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' });
  const [selectedCoin, setSelectedCoin] = useState(null);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedCoins = [...coins].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortConfig.key) {
      case 'rank':
        aValue = a.rank || 0;
        bValue = b.rank || 0;
        break;
      case 'name':
        aValue = a.name || '';
        bValue = b.name || '';
        break;
      case 'price':
        aValue = a.price || 0;
        bValue = b.price || 0;
        break;
      case 'volume':
        aValue = a.volume24h || 0;
        bValue = b.volume24h || 0;
        break;
      case 'change':
        aValue = a.percentChange24h || 0;
        bValue = b.percentChange24h || 0;
        break;
      case 'score':
        aValue = a.score?.totalScore || 0;
        bValue = b.score?.totalScore || 0;
        break;
      default:
        return 0;
    }
    
    if (typeof aValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const formatPrice = (price) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-red-400 font-bold';
    if (score >= 50) return 'text-orange-400 font-semibold';
    if (score >= 30) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const handleRowClick = (coin) => {
    setSelectedCoin(coin.id === selectedCoin?.id ? null : coin);
    if (onCoinSelect) {
      onCoinSelect(coin.id === selectedCoin?.id ? null : coin);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th
                onClick={() => handleSort('rank')}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:bg-slate-600"
              >
                رتبه
                {sortConfig.key === 'rank' && (
                  <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleSort('name')}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:bg-slate-600"
              >
                نام
                {sortConfig.key === 'name' && (
                  <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleSort('price')}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:bg-slate-600"
              >
                قیمت (USD)
                {sortConfig.key === 'price' && (
                  <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleSort('volume')}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:bg-slate-600"
              >
                حجم 24h
                {sortConfig.key === 'volume' && (
                  <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleSort('change')}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:bg-slate-600"
              >
                تغییرات 24h
                {sortConfig.key === 'change' && (
                  <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleSort('score')}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:bg-slate-600"
              >
                امتیاز
                {sortConfig.key === 'score' && (
                  <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCoins.map((coin) => {
              const isSelected = selectedCoin?.id === coin.id;
              const changeColor = coin.percentChange24h >= 0 ? 'text-green-400' : 'text-red-400';
              
              return (
                <tr
                  key={coin.id}
                  onClick={() => handleRowClick(coin)}
                  className={`border-b border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors ${
                    isSelected ? 'bg-slate-700' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm">
                    <span className="font-semibold">#{coin.rank}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <div className="font-medium text-white">{coin.name}</div>
                      <div className="text-xs text-gray-400">{coin.symbol}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    ${formatPrice(coin.price)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    ${formatNumber(coin.volume24h)}
                  </td>
                  <td className={`px-4 py-3 text-sm ${changeColor} font-medium`}>
                    <div className="flex items-center gap-1">
                      {coin.percentChange24h >= 0 ? (
                        <FiTrendingUp />
                      ) : (
                        <FiTrendingDown />
                      )}
                      {coin.percentChange24h >= 0 ? '+' : ''}
                      {coin.percentChange24h.toFixed(2)}%
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm ${getScoreColor(coin.score?.totalScore || 0)}`}>
                    {coin.score?.totalScore?.toFixed(1) || '0.0'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {selectedCoin && (
        <div className="p-4 bg-slate-700 border-t border-slate-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-400">تغییرات 1h</div>
              <div className={`font-medium ${selectedCoin.percentChange1h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {selectedCoin.percentChange1h >= 0 ? '+' : ''}{selectedCoin.percentChange1h.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-gray-400">تغییرات 7d</div>
              <div className={`font-medium ${selectedCoin.percentChange7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {selectedCoin.percentChange7d >= 0 ? '+' : ''}{selectedCoin.percentChange7d.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-gray-400">Market Cap</div>
              <div className="font-medium text-white">${formatNumber(selectedCoin.marketCap)}</div>
            </div>
            <div>
              <div className="text-gray-400">امتیاز الگو</div>
              <div className="font-medium text-yellow-400">
                {selectedCoin.score?.patternScore?.toFixed(1) || '0.0'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoinTable;

