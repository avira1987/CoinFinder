import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PriceChart = ({ coin }) => {
  if (!coin) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center text-gray-400">
        یک کوین را از جدول انتخاب کنید تا نمودار قیمت نمایش داده شود
      </div>
    );
  }

  // ساخت داده‌های نمونه برای نمودار (در حالت واقعی از داده‌های تاریخی استفاده می‌شود)
  const chartData = [
    { time: '00:00', price: coin.price * 0.95 },
    { time: '04:00', price: coin.price * 0.97 },
    { time: '08:00', price: coin.price * 0.99 },
    { time: '12:00', price: coin.price * 1.01 },
    { time: '16:00', price: coin.price * 1.02 },
    { time: '20:00', price: coin.price },
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        نمودار قیمت - {coin.name} ({coin.symbol})
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
            formatter={(value) => [`$${value.toFixed(4)}`, 'قیمت']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            name="قیمت (USD)"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-400">
        قیمت فعلی: <span className="text-white font-semibold">${coin.price.toFixed(4)}</span>
      </div>
    </div>
  );
};

export default PriceChart;

