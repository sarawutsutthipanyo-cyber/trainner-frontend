import { useEffect, useState } from 'react';
import { getMyProfile, getActiveMealPlan } from '../../api';
import ClientLayout from '../../components/layout/ClientLayout';
import styles from './MyMealPlan.module.css';

const DAYS_EN = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAYS_TH = ['จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์','อาทิตย์'];
const MEALS = ['breakfast','lunch','dinner','snack'];
const MEAL_TH = { breakfast:'🌅 มื้อเช้า', lunch:'☀️ มื้อกลางวัน', dinner:'🌙 มื้อเย็น', snack:'🍎 ของว่าง' };
const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

export default function MyMealPlan() {
  const [client, setClient] = useState(null);
  const [plan, setPlan] = useState(null);
  const [activeDay, setActiveDay] = useState(todayIdx);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile().then(async (r) => {
      setClient(r.data);
      try {
        const p = await getActiveMealPlan(r.data.id);
        setPlan(p.data);
      } catch {}
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <ClientLayout><div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลด...</div></ClientLayout>;

  if (!plan) return (
    <ClientLayout>
      <div className={styles.empty}>
        <p>🍽️</p>
        <h2>ยังไม่มีแผนอาหาร</h2>
        <p>รอเทรนเนอร์ออกแบบแผนอาหารให้คุณ</p>
      </div>
    </ClientLayout>
  );

  const meals = plan.meals || {};
  const curDay = meals[DAYS_EN[activeDay]] || {};

  const dayTotals = MEALS.reduce((acc, m) => {
    (curDay[m] || []).forEach((f) => {
      acc.calories += f.calories || 0;
      acc.protein += f.protein || 0;
      acc.carbs += f.carbs || 0;
      acc.fat += f.fat || 0;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const calPct = Math.min(100, (dayTotals.calories / (plan.targetCalories || 1)) * 100);

  return (
    <ClientLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>🍽️ แผนอาหารของฉัน</h1>
          <p className={styles.sub}>เป้าหมาย {Math.round(plan.targetCalories || 0)} kcal/วัน</p>
        </div>

        {/* Macro targets */}
        <div className={styles.macroBar}>
          {[
            { label: 'โปรตีน', val: plan.targetProtein, color: '#6366f1' },
            { label: 'คาร์บ', val: plan.targetCarbs, color: '#f59e0b' },
            { label: 'ไขมัน', val: plan.targetFat, color: '#10b981' },
          ].map((m) => (
            <div key={m.label} className={styles.macroChip} style={{ borderColor: m.color }}>
              <span style={{ color: m.color, fontWeight: 700 }}>{Math.round(m.val || 0)}g</span>
              <span className={styles.macroLabel}>{m.label}</span>
            </div>
          ))}
        </div>

        {/* Day tabs */}
        <div className={styles.dayTabs}>
          {DAYS_TH.map((d, i) => {
            const dd = meals[DAYS_EN[i]] || {};
            const hasMeals = MEALS.some((m) => (dd[m] || []).length > 0);
            return (
              <button
                key={i}
                className={`${styles.dayTab} ${activeDay === i ? styles.activeTab : ''} ${i === todayIdx ? styles.todayTab : ''}`}
                onClick={() => setActiveDay(i)}
              >
                <span>{d}</span>
                {i === todayIdx && <span className={styles.todayBadge}>วันนี้</span>}
                {hasMeals && <span className={styles.dot} />}
              </button>
            );
          })}
        </div>

        {/* Day summary */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <div>
              <span className={styles.calBig}>{Math.round(dayTotals.calories)}</span>
              <span className={styles.calUnit}> / {Math.round(plan.targetCalories || 0)} kcal</span>
            </div>
            <div className={styles.macroSmall}>
              <span style={{ color: '#6366f1' }}>P {Math.round(dayTotals.protein)}g</span>
              <span style={{ color: '#f59e0b' }}>C {Math.round(dayTotals.carbs)}g</span>
              <span style={{ color: '#10b981' }}>F {Math.round(dayTotals.fat)}g</span>
            </div>
          </div>
          <div className={styles.calBar}>
            <div className={styles.calFill} style={{ width: `${calPct}%`, background: calPct > 100 ? '#ef4444' : '#6366f1' }} />
          </div>
        </div>

        {/* Meal sections */}
        {MEALS.map((mealType) => {
          const items = curDay[mealType] || [];
          const mealCal = items.reduce((s, f) => s + (f.calories || 0), 0);
          return (
            <div key={mealType} className={styles.mealCard}>
              <div className={styles.mealHeader}>
                <h3>{MEAL_TH[mealType]}</h3>
                {mealCal > 0 && <span className={styles.mealCal}>{mealCal} kcal</span>}
              </div>

              {items.length === 0 ? (
                <p className={styles.emptyMeal}>— ไม่มีเมนูในมื้อนี้ —</p>
              ) : (
                <div className={styles.foodList}>
                  {items.map((f, i) => (
                    <div key={i} className={styles.foodRow}>
                      <div className={styles.foodLeft}>
                        <span className={styles.foodName}>{f.foodName}</span>
                        <span className={styles.foodQty}>{f.quantity}g</span>
                      </div>
                      <div className={styles.foodRight}>
                        <span className={styles.foodCal}>{f.calories} kcal</span>
                        <div className={styles.foodMacros}>
                          <span style={{ color: '#6366f1' }}>P {f.protein}g</span>
                          <span style={{ color: '#f59e0b' }}>C {f.carbs}g</span>
                          <span style={{ color: '#10b981' }}>F {f.fat}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ClientLayout>
  );
}
