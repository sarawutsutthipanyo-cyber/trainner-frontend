import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientById, getDayEntries, addMealEntry, deleteMealEntry, searchFood } from '../../api';
import { X } from 'lucide-react';
import TrainerLayout from '../../components/layout/TrainerLayout';
import styles from '../client/FoodLogger.module.css';

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_TH = { breakfast: '🌅 เช้า', lunch: '☀️ กลางวัน', dinner: '🌙 เย็น', snack: '🍎 ของว่าง' };
const todayStr = new Date().toISOString().split('T')[0];

export default function FoodLog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(todayStr);
  const [addMeal, setAddMeal] = useState(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [qty, setQty] = useState(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClientById(id).then((r) => {
      setClient(r.data);
      loadEntries(date);
    }).catch(console.error);
  }, [id]);

  const loadEntries = async (d) => {
    try { const r = await getDayEntries(id, d); setEntries(r.data); } catch {}
  };

  const handleDateChange = (d) => { setDate(d); loadEntries(d); };

  const handleSearch = async (q) => {
    setSearch(q);
    if (q.length < 2) return setResults([]);
    try { const r = await searchFood(q); setResults(r.data); } catch {}
  };

  const handleAdd = async (food) => {
    setLoading(true);
    try {
      await addMealEntry(id, { foodItemId: food.id, date, mealType: addMeal, quantity: qty });
      await loadEntries(date);
      setSearch(''); setResults([]); setAddMeal(null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (entryId) => {
    try { await deleteMealEntry(entryId); await loadEntries(date); } catch {}
  };

  const byMeal = MEALS.reduce((acc, m) => ({ ...acc, [m]: entries.filter((e) => e.mealType === m) }), {});
  const totals = entries.reduce((acc, e) => ({
    calories: acc.calories + Number(e.calories),
    protein: acc.protein + Number(e.protein),
    carbs: acc.carbs + Number(e.carbs),
    fat: acc.fat + Number(e.fat),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const pct = client ? Math.min(100, (totals.calories / client.targetCalories) * 100) : 0;

  return (
    <TrainerLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/trainer/clients/${id}`)}>← กลับ</button>
            <h1>🍱 บันทึกอาหาร — {client?.user?.name}</h1>
          </div>
          <input type="date" className="form-control" value={date} onChange={(e) => handleDateChange(e.target.value)} style={{ width: 'auto' }} />
        </div>

        {client && (
          <div className="card">
            <div className={styles.summaryRow}>
              <div>
                <p className={styles.bigCal}>{Math.round(totals.calories)} <span>kcal</span></p>
                <p className={styles.target}>เป้า {Math.round(client.targetCalories)} kcal</p>
              </div>
              <div className={styles.macroRow}>
                {[
                  { label: 'โปรตีน', g: totals.protein, target: client.targetProtein, color: '#6366f1' },
                  { label: 'คาร์บ', g: totals.carbs, target: client.targetCarbs, color: '#f59e0b' },
                  { label: 'ไขมัน', g: totals.fat, target: client.targetFat, color: '#10b981' },
                ].map((m) => (
                  <div key={m.label} className={styles.macroItem}>
                    <div className={styles.macroBg}><div className={styles.macroFill} style={{ height: `${Math.min(100, (m.g / m.target) * 100)}%`, background: m.color }} /></div>
                    <p className={styles.macroG}>{Math.round(m.g)}g</p>
                    <p className={styles.macroLabel}>{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.calBarBg}><div className={styles.calBarFill} style={{ width: `${pct}%`, background: pct > 100 ? 'var(--danger)' : 'var(--success)' }} /></div>
          </div>
        )}

        {MEALS.map((mealType) => (
          <div className="card" key={mealType}>
            <div className={styles.mealHeader}>
              <h3>{MEAL_TH[mealType]}</h3>
              <div className={styles.mealCal}>{Math.round(byMeal[mealType].reduce((s, e) => s + e.calories, 0))} kcal</div>
            </div>
            <div className={styles.entryList}>
              {byMeal[mealType].map((e) => (
                <div key={e.id} className={styles.entryRow}>
                  {e.foodItem?.imageUrl && <img src={e.foodItem.imageUrl} alt={e.foodItem.name} className={styles.entryImg} />}
                  <div className={styles.entryName}>{e.foodItem?.name || '-'}</div>
                  <div className={styles.entryQty}>{e.quantity}g</div>
                  <div className={styles.entryMacros}>
                    <span style={{ color: '#6366f1' }}>P {Math.round(e.protein)}g</span>
                    <span style={{ color: '#f59e0b' }}>C {Math.round(e.carbs)}g</span>
                    <span style={{ color: '#10b981' }}>F {Math.round(e.fat)}g</span>
                  </div>
                  <div className={styles.entryCal}>{e.calories} kcal</div>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(e.id)}><X size={13} /></button>
                </div>
              ))}
            </div>
            {addMeal === mealType ? (
              <div className={styles.addBox}>
                <div className={styles.addInputs}>
                  <input className="form-control" placeholder="🔍 ค้นหาอาหาร..." value={search} onChange={(e) => handleSearch(e.target.value)} autoFocus />
                  <input className="form-control" type="number" placeholder="ปริมาณ (g)" value={qty} onChange={(e) => setQty(Number(e.target.value))} min="1" style={{ width: '120px' }} />
                </div>
                {results.length > 0 && (
                  <div className={styles.dropdown}>
                    {results.map((f) => (
                      <button key={f.id} className={styles.dropdownItem} onClick={() => handleAdd(f)} disabled={loading}>
                        {f.imageUrl
                          ? <img src={f.imageUrl} alt={f.name} className={styles.foodImg} />
                          : <div className={styles.foodImgPlaceholder}>🍽️</div>
                        }
                        <div className={styles.foodInfo}>
                          <span>{f.name}{f.nameTh ? ` (${f.nameTh})` : ''}</span>
                          <span className={styles.foodMeta}>{f.caloriesPer100g} kcal · P:{f.proteinPer100g}g C:{f.carbsPer100g}g F:{f.fatPer100g}g / 100g</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => { setAddMeal(null); setSearch(''); setResults([]); }}>ยกเลิก</button>
              </div>
            ) : (
              <button className={styles.addBtn} onClick={() => setAddMeal(mealType)}>+ เพิ่มอาหาร</button>
            )}
          </div>
        ))}
      </div>
    </TrainerLayout>
  );
}
