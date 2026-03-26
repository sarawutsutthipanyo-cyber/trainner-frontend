import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../../api';
import TrainerLayout from '../../components/layout/TrainerLayout';
import { ArrowLeft, UserPlus } from 'lucide-react';
import styles from './NewClient.module.css';

const activityOptions = [
  { value: 'sedentary', label: 'นั่งทำงานทั้งวัน (Sedentary)' },
  { value: 'light', label: 'ออกกำลังกาย 1-3 วัน/สัปดาห์ (Light)' },
  { value: 'moderate', label: 'ออกกำลังกาย 3-5 วัน/สัปดาห์ (Moderate)' },
  { value: 'active', label: 'ออกกำลังกาย 6-7 วัน/สัปดาห์ (Active)' },
  { value: 'very_active', label: 'ออกกำลังกายหนักมาก (Very Active)' },
];

export default function NewClient() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    pin: '1234',
    goal: 'lose_weight', gender: 'male',
    currentWeight: '', targetWeight: '', height: '', age: '',
    activityLevel: 'moderate', notes: '',
  });
  const [tdeePreview, setTdeePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const calcPreview = () => {
    const { currentWeight: w, height: h, age: a, gender: g, activityLevel: al, goal } = form;
    if (!w || !h || !a) return;
    const bmr = g === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
    const mults = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const tdee = Math.round(bmr * mults[al]);
    const target = goal === 'lose_weight' ? tdee - 500 : goal === 'gain_muscle' ? tdee + 300 : tdee;
    const protein = Math.round(w * 2);
    const fat = Math.round((target * 0.25) / 9);
    const carbs = Math.round((target - protein * 4 - fat * 9) / 4);
    setTdeePreview({ bmr: Math.round(bmr), tdee, target, protein, carbs, fat });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await createClient(form);
      navigate(`/trainer/clients/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TrainerLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /> กลับ</button>
          <h1>เพิ่มลูกเทรนใหม่</h1>
        </div>

        <div className={styles.container}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className="card">
              <h3 className={styles.sectionTitle}>ข้อมูลลูกเทรน</h3>
              <div className="form-group">
                <label>ชื่อ-นามสกุล *</label>
                <input className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="สมชาย ใจดี" />
              </div>
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label>PIN สำหรับเข้าสู่ระบบ (4-6 หลัก)</label>
                <input className="form-control" type="text" inputMode="numeric" maxLength={6} value={form.pin} onChange={(e) => set('pin', e.target.value)} required placeholder="1234" />
                <small style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>ลูกเทรนจะใช้ PIN นี้เพื่อเข้าสู่ระบบ</small>
              </div>
            </div>

            <div className="card">
              <h3 className={styles.sectionTitle}>ข้อมูลร่างกาย</h3>
              <div className="form-grid form-grid-3">
                <div className="form-group">
                  <label>เพศ *</label>
                  <select className="form-control" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>อายุ (ปี) *</label>
                  <input className="form-control" type="number" value={form.age} onChange={(e) => set('age', e.target.value)} required min="10" max="100" placeholder="25" />
                </div>
                <div className="form-group">
                  <label>ส่วนสูง (cm) *</label>
                  <input className="form-control" type="number" value={form.height} onChange={(e) => set('height', e.target.value)} required min="100" max="250" placeholder="170" />
                </div>
                <div className="form-group">
                  <label>น้ำหนักปัจจุบัน (kg) *</label>
                  <input className="form-control" type="number" step="0.1" value={form.currentWeight} onChange={(e) => set('currentWeight', e.target.value)} required placeholder="70" />
                </div>
                <div className="form-group">
                  <label>น้ำหนักเป้าหมาย (kg)</label>
                  <input className="form-control" type="number" step="0.1" value={form.targetWeight} onChange={(e) => set('targetWeight', e.target.value)} placeholder="65" />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className={styles.sectionTitle}>เป้าหมายและกิจกรรม</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>เป้าหมาย *</label>
                  <select className="form-control" value={form.goal} onChange={(e) => set('goal', e.target.value)}>
                    <option value="lose_weight">🔥 ลดน้ำหนัก</option>
                    <option value="gain_muscle">💪 เพิ่มกล้ามเนื้อ</option>
                    <option value="maintain">⚖️ รักษาน้ำหนัก</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>ระดับกิจกรรม *</label>
                  <select className="form-control" value={form.activityLevel} onChange={(e) => set('activityLevel', e.target.value)}>
                    {activityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: '0.75rem' }} onClick={calcPreview}>
                🧮 คำนวณ TDEE ดูตัวอย่าง
              </button>

              {tdeePreview && (
                <div className={styles.tdeePreview}>
                  <div className={styles.tdeeItem}><span>BMR</span><strong>{tdeePreview.bmr} kcal</strong></div>
                  <div className={styles.tdeeItem}><span>TDEE</span><strong>{tdeePreview.tdee} kcal</strong></div>
                  <div className={styles.tdeeItem} style={{ background: '#ede9fe' }}><span>แคลเป้าหมาย</span><strong style={{ color: 'var(--primary)' }}>{tdeePreview.target} kcal</strong></div>
                  <div className={styles.tdeeItem}><span>โปรตีน</span><strong>{tdeePreview.protein}g</strong></div>
                  <div className={styles.tdeeItem}><span>คาร์บ</span><strong>{tdeePreview.carbs}g</strong></div>
                  <div className={styles.tdeeItem}><span>ไขมัน</span><strong>{tdeePreview.fat}g</strong></div>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className={styles.sectionTitle}>หมายเหตุ</h3>
              <div className="form-group">
                <label>ข้อมูลเพิ่มเติม / ข้อจำกัดสุขภาพ</label>
                <textarea className="form-control" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="เช่น มีโรคประจำตัว, แพ้อาหาร, ประวัติการบาดเจ็บ..." />
              </div>
            </div>

            <div className={styles.actions}>
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>ยกเลิก</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'กำลังบันทึก...' : <><UserPlus size={15} /> บันทึกลูกเทรน</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </TrainerLayout>
  );
}
