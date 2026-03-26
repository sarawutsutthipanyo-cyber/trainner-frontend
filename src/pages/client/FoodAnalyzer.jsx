import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeFood, addMealEntry, getMyProfile } from '../../api';
import ClientLayout from '../../components/layout/ClientLayout';
import styles from './FoodAnalyzer.module.css';

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_TH = { breakfast: '🌅 เช้า', lunch: '☀️ กลางวัน', dinner: '🌙 เย็น', snack: '🍎 ของว่าง' };
const todayStr = new Date().toISOString().split('T')[0];

export default function FoodAnalyzer() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResult(null);
    setError('');
    setSaved(false);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setPreview(dataUrl);

      const base64 = dataUrl.split(',')[1];
      const mediaType = file.type || 'image/jpeg';

      setAnalyzing(true);
      try {
        const res = await analyzeFood({ imageBase64: base64, mediaType });
        setResult(res.data);
      } catch (err) {
        setError('วิเคราะห์ไม่สำเร็จ กรุณาลองใหม่');
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveToLog = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const profile = await getMyProfile();
      const clientId = profile.data.id;

      // สร้าง food item ชั่วคราวและบันทึกลง meal entry โดยตรง
      const weight = result.estimatedWeight || 100;
      await addMealEntry(clientId, {
        date: todayStr,
        mealType,
        customFood: {
          name: result.foodName,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          quantity: weight,
        },
      });
      setSaved(true);
    } catch (err) {
      setError('บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const confidenceColor = { high: '#10b981', medium: '#f59e0b', low: '#ef4444' };
  const confidenceLabel = { high: 'แม่นยำสูง', medium: 'ปานกลาง', low: 'ประมาณการ' };

  return (
    <ClientLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>🔬 วิเคราะห์อาหาร AI</h1>
          <p className={styles.sub}>ถ่ายรูปอาหาร แล้ว AI จะประเมินโภชนาการให้อัตโนมัติ</p>
        </div>

        {/* Upload */}
        <label className={styles.uploadBox}>
          {preview ? (
            <img src={preview} alt="food" className={styles.preview} />
          ) : (
            <div className={styles.uploadPlaceholder}>
              <span className={styles.uploadIcon}>📷</span>
              <p>ถ่ายรูปหรือเลือกรูปอาหาร</p>
              <span className={styles.uploadHint}>รองรับ JPG, PNG</span>
            </div>
          )}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
        </label>

        {/* Analyzing */}
        {analyzing && (
          <div className={styles.analyzing}>
            <div className={styles.spinner} />
            <p>AI กำลังวิเคราะห์อาหาร...</p>
          </div>
        )}

        {/* Error */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Result */}
        {result && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <div>
                <h2 className={styles.foodName}>{result.foodName}</h2>
                <p className={styles.foodNameEn}>{result.foodNameEn}</p>
                <p className={styles.serving}>ปริมาณ: {result.servingSize} (~{result.estimatedWeight}g)</p>
              </div>
              <span className={styles.confidence} style={{ background: confidenceColor[result.confidence] + '20', color: confidenceColor[result.confidence] }}>
                {confidenceLabel[result.confidence]}
              </span>
            </div>

            {/* Calories big */}
            <div className={styles.caloriesBig}>
              <span className={styles.calNum}>{result.calories}</span>
              <span className={styles.calUnit}>kcal</span>
            </div>

            {/* Macros */}
            <div className={styles.macros}>
              <div className={styles.macroItem} style={{ borderColor: '#6366f1' }}>
                <span className={styles.macroVal} style={{ color: '#6366f1' }}>{result.protein}g</span>
                <span className={styles.macroLabel}>โปรตีน</span>
              </div>
              <div className={styles.macroItem} style={{ borderColor: '#f59e0b' }}>
                <span className={styles.macroVal} style={{ color: '#f59e0b' }}>{result.carbs}g</span>
                <span className={styles.macroLabel}>คาร์บ</span>
              </div>
              <div className={styles.macroItem} style={{ borderColor: '#10b981' }}>
                <span className={styles.macroVal} style={{ color: '#10b981' }}>{result.fat}g</span>
                <span className={styles.macroLabel}>ไขมัน</span>
              </div>
              <div className={styles.macroItem} style={{ borderColor: '#8b5cf6' }}>
                <span className={styles.macroVal} style={{ color: '#8b5cf6' }}>{result.fiber || 0}g</span>
                <span className={styles.macroLabel}>ใยอาหาร</span>
              </div>
            </div>

            {result.note && <p className={styles.note}>ℹ️ {result.note}</p>}

            {/* Save to log */}
            {!saved ? (
              <div className={styles.saveSection}>
                <label className={styles.mealLabel}>บันทึกลงมื้อ:</label>
                <select className="form-control" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                  {MEALS.map((m) => <option key={m} value={m}>{MEAL_TH[m]}</option>)}
                </select>
                <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} onClick={handleSaveToLog} disabled={saving}>
                  {saving ? 'กำลังบันทึก...' : '💾 บันทึกลงไดอารีอาหาร'}
                </button>
              </div>
            ) : (
              <div className={styles.savedMsg}>
                ✅ บันทึกลงไดอารีอาหารแล้ว
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/client/food')}>ดูไดอารี →</button>
              </div>
            )}

            {/* Retry */}
            <button className={styles.retryBtn} onClick={() => { setPreview(null); setResult(null); setSaved(false); }}>
              📷 วิเคราะห์รูปใหม่
            </button>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
