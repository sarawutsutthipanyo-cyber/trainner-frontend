import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = { protein: '#6366f1', carbs: '#f59e0b', fat: '#10b981' };

export default function MacroChart({ protein, carbs, fat }) {
  const data = [
    { name: 'โปรตีน', value: Math.round(protein * 4), grams: protein },
    { name: 'คาร์บ', value: Math.round(carbs * 4), grams: carbs },
    { name: 'ไขมัน', value: Math.round(fat * 9), grams: fat },
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
          {data.map((entry, i) => (
            <Cell key={i} fill={COLORS[['protein','carbs','fat'][i]]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name, props) => [`${props.payload.grams}g (${value} kcal)`, name]}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontSize: 12, color: '#64748b' }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
