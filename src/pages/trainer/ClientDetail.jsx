import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClientById, getProgressLogs, getCardioLogs, getWorkoutLogs, getActiveProgram, getFoodPhotos } from '../../api';
import TrainerLayout from '../../components/layout/TrainerLayout';
import WeightChart from '../../components/charts/WeightChart';
import MacroChart from '../../components/charts/MacroChart';
import ProgressiveOverloadChart from '../../components/charts/ProgressiveOverloadChart';
import {
  ArrowLeft, Dumbbell, UtensilsCrossed, TrendingUp, Timer,
  ClipboardList, BookOpen, ChevronRight, LayoutGrid, CheckCircle2, Clock, Camera
} from 'lucide-react';
import styles from './ClientDetail.module.css';

const goalLabel = { lose_weight: 'ลดน้ำหนัก', gain_muscle: 'เพิ่มกล้าม', maintain: 'รักษาน้ำหนัก' };
const goalColor = { lose_weight: '#ef4444', gain_muscle: '#6366f1', maintain: '#10b981' };

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [client, setClient] = useState(null);
  const [progressLogs, setProgressLogs] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [cardioLogs, setCardioLogs] = useState([]);
  const [program, setProgram] = useState(null);
  const [foodPhotos, setFoodPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getClientById(id),
      getProgressLogs(id),
      getWorkoutLogs(id, {}),
      getCardioLogs(id),
      getActiveProgram(id),
      getFoodPhotos(id),
    ]).then(([c, pl, wl, cl, pg, fp]) => {
      setClient(c.data);
      setProgressLogs(pl.data);
      setWorkoutLogs(wl.data);
      setCardioLogs(cl.data);
      setProgram(pg.data);
      setFoodPhotos(fp.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <TrainerLayout><div className="loading">กำลังโหลด...</div></TrainerLayout>;
  if (!client) return <TrainerLayout><div className="loading">ไม่พบข้อมูล</div></TrainerLayout>;

  const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

  const tabs = [
    { key: 'overview', icon: LayoutGrid, label: 'ภาพรวม' },
    { key: 'progress', icon: TrendingUp, label: 'ผลการเปลี่ยนแปลง' },
    { key: 'workout', icon: Dumbbell, label: 'ประวัติ Workout' },
    { key: 'cardio', icon: Timer, label: 'คาร์ดิโอ' },
    { key: 'photos', icon: Camera, label: 'รูปอาหาร' },
  ];

  const actions = [
    { to: `/trainer/clients/${id}/workout-log`, icon: Dumbbell, label: 'บันทึก Workout', primary: true },
    { to: `/trainer/clients/${id}/food-log`, icon: UtensilsCrossed, label: 'บันทึกอาหาร', primary: true },
    { to: `/trainer/clients/${id}/progress`, icon: TrendingUp, label: 'วัดผล', primary: true },
    { to: `/trainer/clients/${id}/cardio-log`, icon: Timer, label: 'คาร์ดิโอ', primary: true },
    { to: `/trainer/clients/${id}/program`, icon: ClipboardList, label: 'โปรแกรม', primary: false },
    { to: `/trainer/clients/${id}/meal-plan`, icon: BookOpen, label: 'แผนอาหาร', primary: false },
  ];

  return (
    <TrainerLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.clientHead}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> กลับ
            </button>
            <div className={styles.avatar}>{client.user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <h1>{client.user?.name}</h1>
              <span className="badge" style={{ background: goalColor[client.goal] + '18', color: goalColor[client.goal] }}>
                {goalLabel[client.goal]}
              </span>
            </div>
          </div>
          <div className={styles.headerActions}>
            {actions.map((a) => (
              <Link key={a.to} to={a.to} className={`btn btn-sm ${a.primary ? 'btn-primary' : 'btn-ghost'}`}>
                <a.icon size={14} strokeWidth={2} /> {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map((t) => (
            <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <t.icon size={15} strokeWidth={2} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <div className={styles.overview}>
            <div className={styles.statsRow}>
              <div className="stat-card"><p className="stat-label">น้ำหนักปัจจุบัน</p><p className="stat-value">{client.currentWeight} <span className="stat-unit">kg</span></p></div>
              <div className="stat-card"><p className="stat-label">เป้าหมาย</p><p className="stat-value">{client.targetWeight || '-'} <span className="stat-unit">kg</span></p></div>
              <div className="stat-card"><p className="stat-label">ส่วนสูง</p><p className="stat-value">{client.height} <span className="stat-unit">cm</span></p></div>
              <div className="stat-card"><p className="stat-label">อายุ</p><p className="stat-value">{client.age} <span className="stat-unit">ปี</span></p></div>
            </div>

            <div className={styles.twoCol}>
              <div className="card">
                <h3>พลังงานและสารอาหาร</h3>
                <div className={styles.tdeeGrid}>
                  <div className={styles.tdeeItem}><span>BMR</span><strong>{Math.round(client.bmr)} kcal</strong></div>
                  <div className={styles.tdeeItem}><span>TDEE</span><strong>{Math.round(client.tdee)} kcal</strong></div>
                  <div className={styles.tdeeItem} style={{ background: 'var(--primary-light)' }}>
                    <span>เป้าหมาย/วัน</span>
                    <strong style={{ color: 'var(--primary)' }}>{Math.round(client.targetCalories)} kcal</strong>
                  </div>
                </div>
                <div className="macro-bars" style={{ marginTop: '1rem' }}>
                  {[
                    { label: 'โปรตีน', g: client.targetProtein, kcal: client.targetProtein * 4, color: '#6366f1' },
                    { label: 'คาร์บ', g: client.targetCarbs, kcal: client.targetCarbs * 4, color: '#f59e0b' },
                    { label: 'ไขมัน', g: client.targetFat, kcal: client.targetFat * 9, color: '#10b981' },
                  ].map((m) => (
                    <div className="macro-row" key={m.label}>
                      <span className="macro-label">{m.label}</span>
                      <div className="macro-bar-bg"><div className="macro-bar-fill" style={{ width: `${Math.min(100, (m.kcal / client.targetCalories) * 100)}%`, background: m.color }} /></div>
                      <span className="macro-val">{Math.round(m.g)}g</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3>สัดส่วน Macro</h3>
                <MacroChart protein={client.targetProtein} carbs={client.targetCarbs} fat={client.targetFat} />
              </div>
            </div>

            {program && (
              <div className="card" style={{ marginTop: '1rem' }}>
                <h3>โปรแกรมออกกำลังกาย: {program.name}</h3>
                <div className={styles.programGrid}>
                  {program.days?.map((d) => (
                    <div key={d.id} className={`${styles.dayCard} ${styles[d.type]}`}>
                      <p className={styles.dayName}>{days[d.dayOfWeek]}</p>
                      <p className={styles.dayType}>
                        {d.type === 'rest' ? 'พัก' : d.type === 'cardio' ? `${d.cardioType || 'คาร์ดิโอ'} ${d.cardioMinutes}นาที` : d.name || 'Workout'}
                      </p>
                      {d.exercises?.length > 0 && <p className={styles.dayExCount}>{d.exercises.length} ท่า</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {client.notes && (
              <div className="card" style={{ marginTop: '1rem' }}>
                <h3>หมายเหตุ</h3>
                <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{client.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Progress tab */}
        {tab === 'progress' && (
          <div className={styles.progressTab}>
            {progressLogs.length === 0 ? (
              <div className="card empty-state">
                <TrendingUp size={36} strokeWidth={1.5} style={{ color: 'var(--muted)', marginBottom: '0.75rem' }} />
                <p>ยังไม่มีข้อมูลการวัดผล</p>
                <Link to={`/trainer/clients/${id}/progress`} className="btn btn-primary" style={{ marginTop: '1rem' }}>บันทึกวัดผล</Link>
              </div>
            ) : (
              <>
                <div className="card">
                  <h3>กราฟน้ำหนัก</h3>
                  <WeightChart logs={progressLogs} targetWeight={client.targetWeight} />
                </div>
                <div className="card" style={{ marginTop: '1rem' }}>
                  <h3>ประวัติการวัดผล</h3>
                  <table className="table">
                    <thead><tr><th>วันที่</th><th>น้ำหนัก</th><th>เอว</th><th>อก</th><th>สะโพก</th><th>หมายเหตุ</th></tr></thead>
                    <tbody>
                      {[...progressLogs].reverse().map((l) => (
                        <tr key={l.id}>
                          <td>{new Date(l.date).toLocaleDateString('th-TH')}</td>
                          <td><strong>{l.weight} kg</strong></td>
                          <td>{l.measurements?.waist || '-'} cm</td>
                          <td>{l.measurements?.chest || '-'} cm</td>
                          <td>{l.measurements?.hips || '-'} cm</td>
                          <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{l.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Workout tab */}
        {tab === 'workout' && (
          <div>
            {workoutLogs.length === 0 ? (
              <div className="card empty-state">
                <Dumbbell size={36} strokeWidth={1.5} style={{ color: 'var(--muted)', marginBottom: '0.75rem' }} />
                <p>ยังไม่มีประวัติการออกกำลังกาย</p>
                <Link to={`/trainer/clients/${id}/workout-log`} className="btn btn-primary" style={{ marginTop: '1rem' }}>บันทึก Workout</Link>
              </div>
            ) : (
              <>
                {workoutLogs.length > 0 && (
                  <div className="card" style={{ marginBottom: '1rem' }}>
                    <h3>Progressive Overload</h3>
                    <ProgressiveOverloadChart logs={workoutLogs} />
                  </div>
                )}
              <div className="card">
                <h3>ประวัติ Workout ({workoutLogs.length} ครั้ง)</h3>
                <table className="table" style={{ marginTop: '1rem' }}>
                  <thead><tr><th>วันที่</th><th>จำนวนท่า</th><th>สถานะ</th><th>หมายเหตุ</th></tr></thead>
                  <tbody>
                    {workoutLogs.map((l) => (
                      <tr key={l.id}>
                        <td>{new Date(l.date).toLocaleDateString('th-TH')}</td>
                        <td>{l.exercises?.length || 0} ท่า</td>
                        <td>
                          {l.isCompleted
                            ? <span className="badge" style={{ background: 'var(--success-light)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> เสร็จแล้ว</span>
                            : <span className="badge" style={{ background: 'var(--warning-light)', color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> กำลังทำ</span>
                          }
                        </td>
                        <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{l.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        )}

        {/* Food Photos tab */}
        {tab === 'photos' && (
          <div>
            {foodPhotos.length === 0 ? (
              <div className="card empty-state">
                <Camera size={36} strokeWidth={1.5} style={{ color: 'var(--muted)', marginBottom: '0.75rem' }} />
                <p>ยังไม่มีรูปอาหาร</p>
              </div>
            ) : (
              <div className="card">
                <h3>รูปอาหารจากลูกเทรน ({foodPhotos.length} รูป)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                  {foodPhotos.map((p) => (
                    <div key={p.id} style={{ borderRadius: '10px', overflow: 'hidden', background: '#f8fafc', border: '1px solid var(--border)' }}>
                      <img src={p.photoUrl} alt="food" style={{ width: '100%', height: '130px', objectFit: 'cover', display: 'block' }} />
                      <div style={{ padding: '0.5rem 0.6rem' }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>
                          {{ breakfast:'มื้อเช้า', lunch:'กลางวัน', dinner:'เย็น', snack:'ของว่าง', other:'อื่นๆ' }[p.mealType]}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{new Date(p.createdAt).toLocaleDateString('th-TH', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                        {p.notes && <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>{p.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cardio tab */}
        {tab === 'cardio' && (
          <div>
            {cardioLogs.length === 0 ? (
              <div className="card empty-state">
                <Timer size={36} strokeWidth={1.5} style={{ color: 'var(--muted)', marginBottom: '0.75rem' }} />
                <p>ยังไม่มีประวัติคาร์ดิโอ</p>
                <Link to={`/trainer/clients/${id}/cardio-log`} className="btn btn-primary" style={{ marginTop: '1rem' }}>บันทึกคาร์ดิโอ</Link>
              </div>
            ) : (
              <div className="card">
                <h3>ประวัติคาร์ดิโอ ({cardioLogs.length} ครั้ง · รวม {cardioLogs.reduce((s, c) => s + c.duration, 0)} นาที)</h3>
                <table className="table" style={{ marginTop: '1rem' }}>
                  <thead><tr><th>วันที่</th><th>ประเภท</th><th>เวลา</th><th>ระยะทาง</th><th>แคลที่เผา</th></tr></thead>
                  <tbody>
                    {cardioLogs.map((l) => (
                      <tr key={l.id}>
                        <td>{new Date(l.date).toLocaleDateString('th-TH')}</td>
                        <td>{l.type}</td>
                        <td>{l.duration} นาที</td>
                        <td>{l.distance ? `${l.distance} km` : '-'}</td>
                        <td>{l.caloriesBurned ? `${l.caloriesBurned} kcal` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </TrainerLayout>
  );
}
