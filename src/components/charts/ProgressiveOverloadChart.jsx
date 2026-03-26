import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Dumbbell } from 'lucide-react';

export default function ProgressiveOverloadChart({ logs }) {
  // Build exerciseData map: { exerciseName: [{date, maxWeight}] }
  const exerciseMap = {};

  (logs || []).forEach((log) => {
    const dateStr = log.date ? new Date(log.date).toISOString().split('T')[0] : null;
    if (!dateStr) return;

    (log.exercises || []).forEach((ex) => {
      if (!ex.name) return;
      const maxWeight = Math.max(...(ex.sets || []).map((s) => s.weight || 0));
      if (!exerciseMap[ex.name]) {
        exerciseMap[ex.name] = [];
      }
      // If same exercise appears multiple times on same date, keep the higher weight
      const existing = exerciseMap[ex.name].find((e) => e.date === dateStr);
      if (existing) {
        existing.maxWeight = Math.max(existing.maxWeight, maxWeight);
      } else {
        exerciseMap[ex.name].push({ date: dateStr, maxWeight });
      }
    });
  });

  // Sort each exercise's data by date
  Object.keys(exerciseMap).forEach((name) => {
    exerciseMap[name].sort((a, b) => new Date(a.date) - new Date(b.date));
  });

  const exerciseNames = Object.keys(exerciseMap);

  const [selected, setSelected] = useState(exerciseNames[0] || '');

  if (exerciseNames.length === 0) {
    return (
      <div className="empty-state">
        <Dumbbell size={36} strokeWidth={1.5} style={{ color: 'var(--muted)', marginBottom: '0.75rem' }} />
        <p>ยังไม่มีข้อมูล Progressive Overload</p>
      </div>
    );
  }

  const chartData = (exerciseMap[selected] || []).map((point) => ({
    date: new Date(point.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
    maxWeight: point.maxWeight,
  }));

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <select
          className="form-control"
          style={{ maxWidth: '280px' }}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {exerciseNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {chartData.length === 0 ? (
        <div className="empty-state">
          <Dumbbell size={36} strokeWidth={1.5} style={{ color: 'var(--muted)', marginBottom: '0.75rem' }} />
          <p>ไม่มีข้อมูลสำหรับท่านี้</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: 'var(--muted)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--muted)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v} kg`}
              width={60}
            />
            <Tooltip
              formatter={(value) => [`${value} kg`, 'น้ำหนักสูงสุด']}
              labelStyle={{ fontWeight: 600 }}
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
            />
            <Line
              type="monotone"
              dataKey="maxWeight"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#6366f1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
