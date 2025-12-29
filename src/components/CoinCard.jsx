import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const CoinCard = ({ coin }) => {
  if (!coin) return null;

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
    if (score >= 70) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 30) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const score = coin.score?.totalScore || 0;

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{coin.name}</h3>
          <p className="text-sm text-gray-400">{coin.symbol}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getScoreColor(score)}`}>
          امتیاز: {score.toFixed(1)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-400">قیمت</div>
          <div className="text-lg font-semibold text-white">${formatPrice(coin.price)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Market Cap</div>
          <div className="text-lg font-semibold text-white">${formatNumber(coin.marketCap)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">تغییرات 24h</span>
          <span className={`font-semibold flex items-center gap-1 ${
            coin.percentChange24h >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {coin.percentChange24h >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            {coin.percentChange24h >= 0 ? '+' : ''}{coin.percentChange24h.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">حجم 24h</span>
          <span className="font-semibold text-white">${formatNumber(coin.volume24h)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">رتبه</span>
          <span className="font-semibold text-white">#{coin.rank || coin.cmcRank}</span>
        </div>
      </div>
    </div>
  );
};

export default CoinCard;

