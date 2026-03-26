import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientById, getActiveMealPlan, createMealPlan, updateMealPlan, searchFood } from '../../api';
import TrainerLayout from '../../components/layout/TrainerLayout';
import { ArrowLeft, Save, X, Sunrise, Sun, Moon, Apple } from 'lucide-react';
import styles from './MealPlanBuilder.module.css';

const DAYS_EN = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAYS_TH = ['จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์','อาทิตย์'];
const MEALS = ['breakfast','lunch','dinner','snack'];
const MEAL_ICON = { breakfast: Sunrise, lunch: Sun, dinner: Moon, snack: Apple };
const MEAL_TH = { breakfast:'มื้อเช้า', lunch:'มื้อกลางวัน', dinner:'มื้อเย็น', snack:'ของว่าง' };

const emptyWeek = () => {
  const w = {};
  DAYS_EN.forEach((d) => {
    w[d] = {};
    MEALS.forEach((m) => { w[d][m] = []; });
  });
  return w;
};

export default function MealPlanBuilder() {
  const { id: clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [plan, setPlan] = useState(null);
  const [meals, setMeals] = useState(emptyWeek());
  const [activeDay, setActiveDay] = useState(0);
  const [foodSearch, setFoodSearch] = useState('');
  const [foodResults, setFoodResults] = useState([]);
  const [addTarget, setAddTarget] = useState(null); // {meal:'breakfast'}
  const [addQty, setAddQty] = useState(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getClientById(clientId), getActiveMealPlan(clientId)])
      .then(([c, p]) => {
        setClient(c.data);
        if (p.data) { setPlan(p.data); setMeals(p.data.meals || emptyWeek()); }
      }).catch(console.error);
  }, [clientId]);

  const handleFoodSearch = async (q) => {
    setFoodSearch(q);
    try { const r = await searchFood(q); setFoodResults(r.data); } catch {}
  };

  const addFoodToMeal = (food, mealType) => {
    const ratio = addQty / 100;
    const item = {
      foodName: food.name,
      foodId: food.id,
      quantity: addQty,
      unit: 'g',
      calories: Math.round(food.caloriesPer100g * ratio),
      protein: Math.round(food.proteinPer100g * ratio * 10) / 10,
      carbs: Math.round(food.carbsPer100g * ratio * 10) / 10,
      fat: Math.round(food.fatPer100g * ratio * 10) / 10,
    };
    const day = DAYS_EN[activeDay];
    setMeals((prev) => ({ ...prev, [day]: { ...prev[day], [mealType]: [...prev[day][mealType], item] } }));
    setFoodSearch('');
    setFoodResults([]);
    setAddTarget(null);
  };

  const removeFood = (mealType, idx) => {
    const day = DAYS_EN[activeDay];
    setMeals((prev) => ({
      ...prev, [day]: { ...prev[day], [mealType]: prev[day][mealType].filter((_, i) => i !== idx) }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = {
        meals,
        weekStartDate: new Date().toISOString().split('T')[0],
        targetCalories: client?.targetCalories,
        targetProtein: client?.targetProtein,
        targetCarbs: client?.targetCarbs,
        targetFat: client?.targetFat,
      };
      if (plan) { await updateMealPlan(plan.id, data); }
      else { await createMealPlan(clientId, data); }
      alert('บันทึกแผนอาหารสำเร็จ');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const curDay = meals[DAYS_EN[activeDay]] || {};
  const dayTotals = MEALS.reduce((acc, m) => {
    (curDay[m] || []).forEach((f) => {
      acc.calories += f.calories;
      acc.protein += f.protein;
      acc.carbs += f.carbs;
      acc.fat += f.fat;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <TrainerLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /> กลับ</button>
          <div>
            <h1>แผนมื้ออาหาร</h1>
            {client && <p>สำหรับ {client.user?.name} · เป้า {Math.round(client.targetCalories || 0)} kcal/วัน</p>}
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'กำลังบันทึก...' : <><Save size={15} /> บันทึกแผน</>}</button>
        </div>

        <div className={styles.layout}>
          {/* Day tabs */}
          <div className={styles.dayBar}>
            {DAYS_TH.map((d, i) => {
              const dd = meals[DAYS_EN[i]] || {};
              const totalCal = MEALS.reduce((s, m) => s + (dd[m] || []).reduce((ss, f) => ss + f.calories, 0), 0);
              return (
                <button key={i} className={`${styles.dayBtn} ${activeDay === i ? styles.activeDayBtn : ''}`} onClick={() => setActiveDay(i)}>
                  <span>{d}</span>
                  {totalCal > 0 && <span className={styles.dayCal}>{totalCal} kcal</span>}
                </button>
              );
            })}
          </div>

          {/* Day summary bar */}
          <div className={styles.summaryBar}>
            <div className={styles.summaryItem}><span>แคลรวม</span><strong style={{ color: dayTotals.calories > (client?.targetCalories || 9999) ? 'var(--danger)' : 'var(--success)' }}>{Math.round(dayTotals.calories)}</strong><span>/ {Math.round(client?.targetCalories || 0)} kcal</span></div>
            <div className={styles.summaryItem}><span>โปรตีน</span><strong>{Math.round(dayTotals.protein)}g</strong></div>
            <div className={styles.summaryItem}><span>คาร์บ</span><strong>{Math.round(dayTotals.carbs)}g</strong></div>
            <div className={styles.summaryItem}><span>ไขมัน</span><strong>{Math.round(dayTotals.fat)}g</strong></div>
          </div>

          {/* Meals */}
          <div className={styles.mealsGrid}>
            {MEALS.map((mealType) => {
              const items = curDay[mealType] || [];
              const mealCal = items.reduce((s, f) => s + f.calories, 0);
              return (
                <div key={mealType} className="card">
                  <div className={styles.mealHeader}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {(() => { const Icon = MEAL_ICON[mealType]; return <Icon size={15} strokeWidth={2} />; })()}
                      {MEAL_TH[mealType]}
                    </h4>
                    <span className={styles.mealCal}>{mealCal} kcal</span>
                  </div>
                  <div className={styles.foodList}>
                    {items.map((f, i) => (
                      <div key={i} className={styles.foodRow}>
                        <span className={styles.foodName}>{f.foodName}</span>
                        <span className={styles.foodQty}>{f.quantity}g</span>
                        <span className={styles.foodCal}>{f.calories} kcal</span>
                        <span className={styles.foodMacro}>P:{f.protein}g C:{f.carbs}g F:{f.fat}g</span>
                        <button className={styles.removeBtn} onClick={() => removeFood(mealType, i)}><X size={13} /></button>
                      </div>
                    ))}
                  </div>
                  {addTarget?.meal === mealType ? (
                    <div className={styles.addForm}>
                      <input className="form-control" value={foodSearch} onChange={(e) => handleFoodSearch(e.target.value)} onFocus={() => handleFoodSearch(foodSearch)} placeholder="🔍 ค้นหาอาหาร..." autoFocus />
                      <input className="form-control" type="number" value={addQty} onChange={(e) => setAddQty(Number(e.target.value))} placeholder="ปริมาณ (g)" min="1" max="1000" />
                      {foodResults.length > 0 && (
                        <div className={styles.foodDropdown}>
                          {foodResults.map((f) => (
                            <button key={f.id} className={styles.foodOption} onClick={() => addFoodToMeal(f, mealType)}>
                              {f.imageUrl && <img src={f.imageUrl} alt={f.nameTh || f.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span>{f.nameTh || f.name}</span>
                                <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{f.name} · {f.caloriesPer100g} kcal · P:{f.proteinPer100g}g C:{f.carbsPer100g}g F:{f.fatPer100g}g /100g</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => setAddTarget(null)}>ยกเลิก</button>
                    </div>
                  ) : (
                    <button className={styles.addBtn} onClick={() => { setAddTarget({ meal: mealType }); setFoodSearch(''); setFoodResults([]); }}>
                      + เพิ่มอาหาร
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TrainerLayout>
  );
}
