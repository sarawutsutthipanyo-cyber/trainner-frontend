import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientById, getActiveProgram, getTodayLog, saveWorkoutLog, completeWorkout } from '../../api';
import TrainerLayout from '../../components/layout/TrainerLayout';
import styles from '../client/TodayWorkout.module.css';

const todayStr = new Date().toISOString().split('T')[0];
const dayOfWeek = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

export default function WorkoutLog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [program, setProgram] = useState(null);
  const [log, setLog] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [date, setDate] = useState(todayStr);

  useEffect(() => {
    getClientById(id).then(async (r) => {
      setClient(r.data);
      const [pg, lg] = await Promise.all([getActiveProgram(id), getTodayLog(id)]);
      const todayDay = pg.data?.days?.find((d) => d.dayOfWeek === dayOfWeek);
      setProgram(todayDay);
      if (lg.data) {
        setLog(lg.data);
        setExercises(lg.data.exercises || []);
        setCompleted(lg.data.isCompleted);
      } else if (todayDay?.exercises) {
        setExercises(todayDay.exercises.map((ex) => ({
          ...ex,
          sets: Array.from({ length: ex.sets }, () => ({ reps: ex.reps, weight: ex.weight, completed: false })),
        })));
      }
    }).catch(console.error);
  }, [id]);

  const toggleSet = (exIdx, setIdx) => {
    setExercises((prev) => prev.map((ex, i) => i !== exIdx ? ex : {
      ...ex,
      sets: ex.sets.map((s, j) => j !== setIdx ? s : { ...s, completed: !s.completed }),
    }));
  };

  const updateSet = (exIdx, setIdx, field, val) => {
    setExercises((prev) => prev.map((ex, i) => i !== exIdx ? ex : {
      ...ex,
      sets: ex.sets.map((s, j) => j !== setIdx ? s : { ...s, [field]: Number(val) }),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await saveWorkoutLog(id, { date, exercises, programDayId: program?.id });
      setLog(r.data);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleComplete = async () => {
    await handleSave();
    if (!log?.id) return;
    try {
      await completeWorkout(log.id);
      setCompleted(true);
    } catch (err) { console.error(err); }
  };

  const totalSets = exercises.reduce((s, ex) => s + (ex.sets?.length || 0), 0);
  const doneSets = exercises.reduce((s, ex) => s + (ex.sets?.filter((st) => st.completed).length || 0), 0);
  const progress = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;

  return (
    <TrainerLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/trainer/clients/${id}`)}>← กลับ</button>
            <div>
              <h1>🏋️ บันทึก Workout — {client?.user?.name}</h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 'auto' }} />
            {completed && <span className="badge" style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '0.4rem 1rem' }}>✅ เสร็จสมบูรณ์!</span>}
          </div>
        </div>

        {exercises.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">😴</div>
            <p>วันนี้ไม่มีโปรแกรมออกกำลังกาย หรือยังไม่ได้สร้างโปรแกรม</p>
          </div>
        ) : (
          <>
            <div className={styles.progressBar}>
              <div className={styles.progressInfo}>
                <span>{doneSets} / {totalSets} เซต</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className={styles.progressBg}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className={styles.exerciseList}>
              {exercises.map((ex, exIdx) => {
                const exDone = ex.sets?.every((s) => s.completed);
                return (
                  <div key={exIdx} className={`${styles.exCard} ${exDone ? styles.exDone : ''}`}>
                    <div className={styles.exHeader}>
                      <h3>{ex.name}</h3>
                      {exDone && <span className="badge" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>✅</span>}
                    </div>
                    <div className={styles.setList}>
                      <div className={styles.setHeader}>
                        <span>เซต</span><span>น้ำหนัก (kg)</span><span>จำนวนครั้ง</span><span>เสร็จ</span>
                      </div>
                      {(ex.sets || []).map((s, setIdx) => (
                        <div key={setIdx} className={`${styles.setRow} ${s.completed ? styles.setCompleted : ''}`}>
                          <span className={styles.setNum}>{setIdx + 1}</span>
                          <input className={styles.setInput} type="number" step="2.5" min="0" value={s.weight}
                            onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)} disabled={s.completed} />
                          <input className={styles.setInput} type="number" min="1" value={s.reps}
                            onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)} disabled={s.completed} />
                          <button className={`${styles.doneBtn} ${s.completed ? styles.doneBtnActive : ''}`}
                            onClick={() => toggleSet(exIdx, setIdx)}>
                            {s.completed ? '✅' : '○'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {!completed && (
              <div className={styles.actions}>
                <button className="btn btn-ghost" onClick={handleSave} disabled={saving}>{saving ? 'กำลังบันทึก...' : '💾 บันทึกความคืบหน้า'}</button>
                <button className="btn btn-success" onClick={handleComplete} disabled={progress < 100}>
                  {progress < 100 ? `ทำให้ครบก่อน (${Math.round(progress)}%)` : '🎉 เสร็จ Workout!'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </TrainerLayout>
  );
}
