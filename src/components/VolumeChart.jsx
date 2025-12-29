import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VolumeChart = ({ coin }) => {
  if (!coin) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center text-gray-400">
        یک کوین را از جدول انتخاب کنید تا نمودار حجم نمایش داده شود
      </div>
    );
  }

  // ساخت داده‌های نمونه برای نمودار
  const chartData = [
    { period: '00:00', volume: coin.volume24h * 0.8 },
    { period: '06:00', volume: coin.volume24h * 0.9 },
    { period: '12:00', volume: coin.volume24h * 1.1 },
    { period: '18:00', volume: coin.volume24h },
  ];

  const formatVolume = (value) => {
    if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
    return value.toFixed(2);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        نمودار حجم معاملات - {coin.name} ({coin.symbol})
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis 
            dataKey="period" 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tickFormatter={formatVolume}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
            formatter={(value) => [`$${formatVolume(value)}`, 'حجم']}
          />
          <Legend />
          <Bar
            dataKey="volume"
            fill="#10b981"
            name="حجم معاملات (USD)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-400">
        حجم 24h: <span className="text-white font-semibold">${formatVolume(coin.volume24h)}</span>
        {coin.volumeChange24h && (
          <span className={`ml-4 ${coin.volumeChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ({coin.volumeChange24h >= 0 ? '+' : ''}{coin.volumeChange24h.toFixed(2)}%)
          </span>
        )}
      </div>
    </div>
  );
};

export default VolumeChart;

