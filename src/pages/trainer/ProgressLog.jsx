import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientById, getProgressLogs, addProgressLog, deleteProgressLog } from '../../api';
import TrainerLayout from '../../components/layout/TrainerLayout';
import WeightChart from '../../components/charts/WeightChart';
import styles from '../client/ProgressTracker.module.css';

const todayStr = new Date().toISOString().split('T')[0];
const emptyForm = { date: todayStr, weight: '', bodyFat: '', notes: '', measurements: { waist: '', chest: '', hips: '', leftArm: '', rightArm: '', leftThigh: '', rightThigh: '' } };
const measureLabels = { waist: 'เอว', chest: 'อก', hips: 'สะโพก', leftArm: 'แขนซ้าย', rightArm: 'แขนขวา', leftThigh: 'ต้นขาซ้าย', rightThigh: 'ต้นขาขวา' };

export default function ProgressLog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getClientById(id), getProgressLogs(id)]).then(([c, l]) => {
      setClient(c.data);
      setLogs(l.data);
    }).catch(console.error);
  }, [id]);

  const setMeasure = (key, val) => setForm((f) => ({ ...f, measurements: { ...f.measurements, [key]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await addProgressLog(id, form);
      setLogs((prev) => [...prev, r.data]);
      setShowForm(false);
      setForm(emptyForm);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (logId) => {
    if (!confirm('ลบข้อมูลนี้?')) return;
    try { await deleteProgressLog(logId); setLogs((prev) => prev.filter((l) => l.id !== logId)); } catch {}
  };

  const latest = logs[logs.length - 1];
  const first = logs[0];
  const weightDiff = latest && first ? (Number(latest.weight) - Number(first.weight)).toFixed(1) : null;

  return (
    <TrainerLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/trainer/clients/${id}`)}>← กลับ</button>
            <h1>📈 วัดผล — {client?.user?.name}</h1>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ บันทึกวัดผล</button>
        </div>

        {latest && (
          <div className={styles.summaryRow}>
            <div className="stat-card">
              <p className="stat-label">น้ำหนักล่าสุด</p>
              <p className="stat-value">{latest.weight} <span className="stat-unit">kg</span></p>
              {weightDiff !== null && (
                <p className={styles.diff} style={{ color: Number(weightDiff) < 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {Number(weightDiff) > 0 ? '+' : ''}{weightDiff} kg จากเริ่มต้น
                </p>
              )}
            </div>
            <div className="stat-card">
              <p className="stat-label">เป้าหมาย</p>
              <p className="stat-value">{client?.targetWeight || '-'} <span className="stat-unit">kg</span></p>
              {client?.targetWeight && <p className={styles.diff}>เหลืออีก {Math.abs(Number(latest.weight) - Number(client.targetWeight)).toFixed(1)} kg</p>}
            </div>
            <div className="stat-card"><p className="stat-label">เอว</p><p className="stat-value">{latest.measurements?.waist || '-'} <span className="stat-unit">cm</span></p></div>
            <div className="stat-card"><p className="stat-label">วัดผลทั้งหมด</p><p className="stat-value">{logs.length} <span className="stat-unit">ครั้ง</span></p></div>
          </div>
        )}

        {logs.length > 1 && (
          <div className="card">
            <h3>กราฟน้ำหนัก</h3>
            <WeightChart logs={logs} targetWeight={client?.targetWeight} />
          </div>
        )}

        <div className="card">
          <h3>ประวัติการวัดผล</h3>
          {logs.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📏</div><p>ยังไม่มีข้อมูล กด "บันทึกวัดผล" เพื่อเริ่มต้น</p></div>
          ) : (
            <div className={styles.tableWrap}>
              <table className="table">
                <thead>
                  <tr><th>วันที่</th><th>น้ำหนัก</th><th>เอว</th><th>อก</th><th>สะโพก</th><th>แขน</th><th>ต้นขา</th><th>หมายเหตุ</th><th></th></tr>
                </thead>
                <tbody>
                  {[...logs].reverse().map((l) => (
                    <tr key={l.id}>
                      <td>{new Date(l.date).toLocaleDateString('th-TH')}</td>
                      <td><strong>{l.weight} kg</strong></td>
                      <td>{l.measurements?.waist || '-'}</td>
                      <td>{l.measurements?.chest || '-'}</td>
                      <td>{l.measurements?.hips || '-'}</td>
                      <td>{l.measurements?.leftArm || '-'}</td>
                      <td>{l.measurements?.leftThigh || '-'}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{l.notes || '-'}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>ลบ</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>📏 บันทึกการวัดผล</h3>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label>วันที่</label>
                    <input className="form-control" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>น้ำหนัก (kg) *</label>
                    <input className="form-control" type="number" step="0.1" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} required placeholder="70.5" />
                  </div>
                  <div className="form-group">
                    <label>ไขมันในร่างกาย (%)</label>
                    <input className="form-control" type="number" step="0.1" value={form.bodyFat} onChange={(e) => setForm((f) => ({ ...f, bodyFat: e.target.value }))} placeholder="20" />
                  </div>
                </div>
                <h4 style={{ marginTop: '1rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>การวัดสัดส่วน (cm)</h4>
                <div className="form-grid form-grid-2">
                  {Object.entries(measureLabels).map(([key, label]) => (
                    <div className="form-group" key={key}>
                      <label>{label}</label>
                      <input className="form-control" type="number" step="0.1" value={form.measurements[key]} onChange={(e) => setMeasure(key, e.target.value)} placeholder="cm" />
                    </div>
                  ))}
                </div>
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label>หมายเหตุ</label>
                  <textarea className="form-control" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="รู้สึกอย่างไรบ้าง..." />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>ยกเลิก</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TrainerLayout>
  );
}
