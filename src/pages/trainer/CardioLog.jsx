import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientById, getCardioLogs, addCardioLog, deleteCardioLog } from '../../api';
import TrainerLayout from '../../components/layout/TrainerLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '../client/CardioLogger.module.css';

const todayStr = new Date().toISOString().split('T')[0];
const TYPES = ['running', 'cycling', 'swimming', 'hiit', 'walking', 'jump_rope', 'other'];
const TYPE_LABEL = { running: '🏃 วิ่ง', cycling: '🚴 จักรยาน', swimming: '🏊 ว่ายน้ำ', hiit: '⚡ HIIT', walking: '🚶 เดิน', jump_rope: '🪢 กระโดดเชือก', other: '💪 อื่นๆ' };
const emptyForm = { date: todayStr, type: 'running', duration: '', distance: '', caloriesBurned: '', notes: '' };

export default function CardioLog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getClientById(id), getCardioLogs(id)]).then(([c, l]) => {
      setClient(c.data);
      setLogs(l.data);
    }).catch(console.error);
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const estimateCal = () => {
    if (!form.duration || !form.type) return;
    const mets = { running: 9, cycling: 7, swimming: 8, hiit: 10, walking: 3.5, jump_rope: 11, other: 6 };
    const weight = client?.currentWeight || 70;
    const cal = Math.round(mets[form.type] * weight * (Number(form.duration) / 60));
    set('caloriesBurned', cal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await addCardioLog(id, form);
      setLogs((prev) => [r.data, ...prev]);
      setShowForm(false);
      setForm(emptyForm);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (logId) => {
    if (!confirm('ลบข้อมูลนี้?')) return;
    try { await deleteCardioLog(logId); setLogs((prev) => prev.filter((l) => l.id !== logId)); } catch {}
  };

  const totalMinutes = logs.reduce((s, l) => s + Number(l.duration), 0);
  const totalCal = logs.reduce((s, l) => s + Number(l.caloriesBurned || 0), 0);
  const totalKm = logs.reduce((s, l) => s + Number(l.distance || 0), 0);

  const chartData = logs.slice(0, 14).reverse().map((l) => ({
    date: new Date(l.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
    minutes: Number(l.duration),
  }));

  return (
    <TrainerLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/trainer/clients/${id}`)}>← กลับ</button>
            <h1>🏃 คาร์ดิโอ — {client?.user?.name}</h1>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ บันทึกคาร์ดิโอ</button>
        </div>

        <div className="stat-grid">
          <div className="stat-card"><p className="stat-label">รวมทั้งหมด</p><p className="stat-value">{logs.length} <span className="stat-unit">ครั้ง</span></p></div>
          <div className="stat-card"><p className="stat-label">เวลารวม</p><p className="stat-value">{totalMinutes} <span className="stat-unit">นาที</span></p></div>
          <div className="stat-card"><p className="stat-label">แคลรวม</p><p className="stat-value">{Math.round(totalCal)} <span className="stat-unit">kcal</span></p></div>
          <div className="stat-card"><p className="stat-label">ระยะทางรวม</p><p className="stat-value">{totalKm.toFixed(1)} <span className="stat-unit">km</span></p></div>
        </div>

        {chartData.length > 1 && (
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>เวลาคาร์ดิโอ (14 วันล่าสุด)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip formatter={(v) => [`${v} นาที`, 'เวลา']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="minutes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>ประวัติคาร์ดิโอ</h3>
          {logs.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🏃</div><p>ยังไม่มีข้อมูลคาร์ดิโอ</p></div>
          ) : (
            <div className={styles.logList}>
              {logs.map((l) => (
                <div key={l.id} className={styles.logRow}>
                  <div className={styles.logDate}>{new Date(l.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</div>
                  <div className={styles.logType}>{TYPE_LABEL[l.type]}</div>
                  <div className={styles.logStats}>
                    <span>⏱ {l.duration} นาที</span>
                    {l.distance && <span>📍 {l.distance} km</span>}
                    {l.caloriesBurned && <span>🔥 {l.caloriesBurned} kcal</span>}
                  </div>
                  {l.notes && <div className={styles.logNotes}>{l.notes}</div>}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>ลบ</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>🏃 บันทึกคาร์ดิโอ</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label>วันที่</label>
                    <input className="form-control" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>ประเภท</label>
                    <select className="form-control" value={form.type} onChange={(e) => set('type', e.target.value)}>
                      {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>ระยะเวลา (นาที) *</label>
                    <input className="form-control" type="number" value={form.duration} onChange={(e) => set('duration', e.target.value)} required min="1" placeholder="30" />
                  </div>
                  <div className="form-group">
                    <label>ระยะทาง (km)</label>
                    <input className="form-control" type="number" step="0.1" value={form.distance} onChange={(e) => set('distance', e.target.value)} placeholder="5.0" />
                  </div>
                  <div className="form-group">
                    <label>แคลที่เผา (kcal)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input className="form-control" type="number" value={form.caloriesBurned} onChange={(e) => set('caloriesBurned', e.target.value)} placeholder="250" />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={estimateCal} title="คำนวณอัตโนมัติ">🧮</button>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>หมายเหตุ</label>
                  <input className="form-control" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="รู้สึกอย่างไร..." />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>ยกเลิก</button>
                  <button type="submit" className="btn btn-success" disabled={loading}>{loading ? 'กำลังบันทึก...' : '✅ บันทึก'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TrainerLayout>
  );
}
