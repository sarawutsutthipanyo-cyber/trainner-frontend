import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientById, getExercises, getActiveProgram, createProgram, updateProgramDay } from '../../api';
import TrainerLayout from '../../components/layout/TrainerLayout';
import { ArrowLeft, Save, Plus, X, Check, Dumbbell, Timer, Moon } from 'lucide-react';
import styles from './ProgramBuilder.module.css';

const DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
const MUSCLE_GROUPS = ['chest','back','legs','shoulders','arms','core','cardio','full_body'];
const MUSCLE_LABEL = { chest:'อก', back:'หลัง', legs:'ขา', shoulders:'ไหล่', arms:'แขน', core:'คอร์', cardio:'คาร์ดิโอ', full_body:'เต็มตัว' };

const defaultDay = (i) => ({ dayOfWeek: i, type: 'rest', name: '', exercises: [], cardioType: '', cardioMinutes: 0 });

export default function ProgramBuilder() {
  const { id: clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [days, setDays] = useState(DAYS.map((_, i) => defaultDay(i)));
  const [programName, setProgramName] = useState('โปรแกรมใหม่');
  const [activeDay, setActiveDay] = useState(0);
  const [filterGroup, setFilterGroup] = useState('');
  const [searchEx, setSearchEx] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([getClientById(clientId), getExercises(), getActiveProgram(clientId)])
      .then(([c, e, p]) => {
        setClient(c.data);
        setExercises(e.data);
        if (p.data) {
          setProgramName(p.data.name);
          const filled = DAYS.map((_, i) => {
            const d = p.data.days?.find((d) => d.dayOfWeek === i);
            return d || defaultDay(i);
          });
          setDays(filled);
        }
      }).catch(console.error);
  }, [clientId]);

  const setDay = (i, patch) => setDays((prev) => prev.map((d, idx) => idx === i ? { ...d, ...patch } : d));

  const addExercise = (ex) => {
    const cur = days[activeDay];
    if (cur.exercises.find((e) => e.exerciseId === ex.id)) return;
    setDay(activeDay, {
      exercises: [...cur.exercises, { exerciseId: ex.id, name: ex.name, sets: 3, reps: 12, weight: 0, restSeconds: 60, notes: '' }],
    });
  };

  const removeExercise = (exId) => {
    setDay(activeDay, { exercises: days[activeDay].exercises.filter((e) => e.exerciseId !== exId) });
  };

  const updateExercise = (exId, patch) => {
    setDay(activeDay, {
      exercises: days[activeDay].exercises.map((e) => e.exerciseId === exId ? { ...e, ...patch } : e),
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await createProgram({ clientId, name: programName, days });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredEx = exercises.filter((e) => {
    const matchGroup = !filterGroup || e.muscleGroup === filterGroup;
    const matchSearch = !searchEx || e.name.toLowerCase().includes(searchEx.toLowerCase());
    return matchGroup && matchSearch;
  });

  const curDay = days[activeDay];

  return (
    <TrainerLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /> กลับ</button>
          <div>
            <input className={styles.programName} value={programName} onChange={(e) => setProgramName(e.target.value)} />
            {client && <p className={styles.clientName}>สำหรับ: {client.user?.name}</p>}
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {saved ? <><Check size={15} /> บันทึกแล้ว</> : loading ? 'กำลังบันทึก...' : <><Save size={15} /> บันทึกโปรแกรม</>}
          </button>
        </div>

        <div className={styles.builder}>
          {/* Day tabs */}
          <div className={styles.dayTabs}>
            {DAYS.map((d, i) => (
              <button key={i} className={`${styles.dayTab} ${activeDay === i ? styles.active : ''} ${styles[days[i].type]}`} onClick={() => setActiveDay(i)}>
                <span className={styles.dayTabName}>{d}</span>
                <span className={styles.dayTabType}>{days[i].type === 'rest' ? <Moon size={13} /> : days[i].type === 'cardio' ? <Timer size={13} /> : <Dumbbell size={13} />}</span>
              </button>
            ))}
          </div>

          <div className={styles.dayConfig}>
            {/* Day type selector */}
            <div className={styles.typeSelector}>
              {['workout','cardio','rest'].map((t) => (
                <button key={t} className={`${styles.typeBtn} ${curDay.type === t ? styles.typeActive : ''}`} onClick={() => setDay(activeDay, { type: t })}>
                  {t === 'rest' ? <><Moon size={14} /> วันพัก</> : t === 'cardio' ? <><Timer size={14} /> คาร์ดิโอ</> : <><Dumbbell size={14} /> เวทส์</>}
                </button>
              ))}
            </div>

            {curDay.type === 'cardio' && (
              <div className={styles.cardioConfig}>
                <div className="form-group">
                  <label>ประเภทคาร์ดิโอ</label>
                  <select className="form-control" value={curDay.cardioType} onChange={(e) => setDay(activeDay, { cardioType: e.target.value })}>
                    {['วิ่ง','จักรยาน','ว่ายน้ำ','HIIT','กระโดดเชือก','เดิน'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>ระยะเวลา (นาที)</label>
                  <input className="form-control" type="number" value={curDay.cardioMinutes} onChange={(e) => setDay(activeDay, { cardioMinutes: Number(e.target.value) })} min="0" max="180" />
                </div>
              </div>
            )}

            {curDay.type === 'workout' && (
              <div className={styles.workoutConfig}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>ชื่อ Session (เช่น Chest & Triceps)</label>
                  <input className="form-control" value={curDay.name} onChange={(e) => setDay(activeDay, { name: e.target.value })} placeholder="Push Day" />
                </div>

                {/* Selected exercises */}
                <div className={styles.selectedExercises}>
                  <h4>ท่าที่เลือก ({curDay.exercises.length})</h4>
                  {curDay.exercises.length === 0 && <p className={styles.emptyHint}>เลือกท่าจากรายการด้านล่าง</p>}
                  {curDay.exercises.map((ex) => (
                    <div key={ex.exerciseId} className={styles.exRow}>
                      <span className={styles.exName}>{ex.name}</span>
                      <input className={styles.exInput} type="number" value={ex.sets} onChange={(e) => updateExercise(ex.exerciseId, { sets: Number(e.target.value) })} min="1" max="10" title="Sets" />
                      <span className={styles.exLabel}>เซต ×</span>
                      <input className={styles.exInput} type="number" value={ex.reps} onChange={(e) => updateExercise(ex.exerciseId, { reps: Number(e.target.value) })} min="1" max="100" title="Reps" />
                      <span className={styles.exLabel}>ครั้ง</span>
                      <input className={styles.exInput} type="number" step="2.5" value={ex.weight} onChange={(e) => updateExercise(ex.exerciseId, { weight: Number(e.target.value) })} min="0" title="Weight (kg)" />
                      <span className={styles.exLabel}>kg</span>
                      <button className="btn btn-danger btn-sm" onClick={() => removeExercise(ex.exerciseId)}><X size={13} /></button>
                    </div>
                  ))}
                </div>

                {/* Exercise library */}
                <div className={styles.exLibrary}>
                  <h4>คลังท่าออกกำลังกาย</h4>
                  <div className={styles.exFilters}>
                    <input className="form-control" placeholder="🔍 ค้นหาท่า..." value={searchEx} onChange={(e) => setSearchEx(e.target.value)} />
                    <select className="form-control" value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
                      <option value="">กล้ามเนื้อทั้งหมด</option>
                      {MUSCLE_GROUPS.map((g) => <option key={g} value={g}>{MUSCLE_LABEL[g]}</option>)}
                    </select>
                  </div>
                  <div className={styles.exList}>
                    {filteredEx.map((ex) => {
                      const added = curDay.exercises.some((e) => e.exerciseId === ex.id);
                      return (
                        <button key={ex.id} className={`${styles.exItem} ${added ? styles.exAdded : ''}`} onClick={() => !added && addExercise(ex)}>
                          <span className={styles.exItemName}>{ex.name}</span>
                          <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.7rem' }}>{MUSCLE_LABEL[ex.muscleGroup]}</span>
                          {added ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Plus size={14} style={{ color: 'var(--muted)' }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {curDay.type === 'rest' && (
              <div className={styles.restDay}>
                <Moon size={40} strokeWidth={1.5} style={{ color: 'var(--muted)' }} />
                <p>วันพัก — ให้ร่างกายฟื้นฟู</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TrainerLayout>
  );
}
