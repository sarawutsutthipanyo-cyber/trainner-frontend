import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function WeightChart({ logs, targetWeight }) {
  const data = logs.map((l) => ({
    date: new Date(l.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
    weight: Number(l.weight),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          formatter={(v) => [`${v} kg`, 'น้ำหนัก']}
        />
        {targetWeight && (
          <ReferenceLine y={targetWeight} stroke="#10b981" strokeDasharray="4 4" label={{ value: `เป้า ${targetWeight}kg`, fontSize: 11, fill: '#10b981' }} />
        )}
        <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
