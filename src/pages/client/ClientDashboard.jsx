import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile, getActiveProgram } from '../../api';
import { Dumbbell, Timer, Moon, Camera, ChevronRight, Flame } from 'lucide-react';
import ClientLayout from '../../components/layout/ClientLayout';
import styles from './ClientDashboard.module.css';

const DAY_TH = ['จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์','อาทิตย์'];
// JS getDay(): 0=Sun,1=Mon,...,6=Sat → convert to 0=Mon,...,6=Sun
const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const [client, setClient] = useState(null);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile().then(async (r) => {
      setClient(r.data);
      try {
        const pg = await getActiveProgram(r.data.id);
        setProgram(pg.data);
      } catch {
        // no active program is fine
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <ClientLayout><div className={styles.loading}>กำลังโหลด...</div></ClientLayout>;

  const today = program?.days?.find((d) => d.dayOfWeek === todayIdx);

  return (
    <ClientLayout>
      <div className={styles.content}>
        {/* Greeting */}
        <div className={styles.greeting}>
          <h1>สวัสดี, {client?.user?.name || user?.name}</h1>
          <p>วันนี้คือวัน{DAY_TH[todayIdx]}</p>
        </div>

        {/* Today's workout */}
        <div className={`${styles.todayCard} ${styles[today?.type || 'rest']}`}>
          <div className={styles.todayIcon}>
            {!today || today.type === 'rest' ? <Moon size={32} strokeWidth={1.5} /> :
             today.type === 'cardio' ? <Timer size={32} strokeWidth={1.5} /> :
             <Dumbbell size={32} strokeWidth={1.5} />}
          </div>
          <div className={styles.todayInfo}>
            <p className={styles.todayLabel}>วันนี้</p>
            <h2 className={styles.todayTitle}>
              {!today || today.type === 'rest' ? 'วันพัก' :
               today.type === 'cardio' ? `คาร์ดิโอ — ${today.cardioType || ''} ${today.cardioMinutes} นาที` :
               today.name || 'Workout'}
            </h2>
            {today?.exercises?.length > 0 && (
              <p className={styles.todayMeta}>{today.exercises.length} ท่า</p>
            )}
          </div>
        </div>

        {/* Weekly schedule */}
        {program ? (
          <div className={styles.section}>
            <h3>ตารางสัปดาห์นี้ — {program.name}</h3>
            <div className={styles.weekGrid}>
              {DAY_TH.map((day, i) => {
                const d = program.days?.find((dd) => dd.dayOfWeek === i);
                const isToday = i === todayIdx;
                return (
                  <div key={i} className={`${styles.dayCell} ${isToday ? styles.dayCellToday : ''} ${styles[d?.type || 'rest']}`}>
                    <p className={styles.dayCellName}>{day}</p>
                    <div className={styles.dayCellIcon}>
                      {!d || d.type === 'rest' ? <Moon size={16} strokeWidth={1.5} /> :
                       d.type === 'cardio' ? <Timer size={16} strokeWidth={1.5} /> :
                       <Dumbbell size={16} strokeWidth={1.5} />}
                    </div>
                    <p className={styles.dayCellType}>
                      {!d || d.type === 'rest' ? 'พัก' :
                       d.type === 'cardio' ? `${d.cardioMinutes}นาที` :
                       d.name || 'Workout'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={styles.emptyProgram}>
            <Dumbbell size={36} strokeWidth={1.5} />
            <p>ยังไม่มีโปรแกรมออกกำลังกาย รอเทรนเนอร์ออกแบบให้</p>
          </div>
        )}

        {/* Goals */}
        {client && (
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <Flame size={18} style={{ color: '#ef4444' }} />
              <div>
                <p className={styles.statLabel}>แคลเป้าหมาย</p>
                <p className={styles.statVal}>{Math.round(client.targetCalories)} kcal</p>
              </div>
            </div>
            <div className={styles.statBox}>
              <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '1rem' }}>P</span>
              <div>
                <p className={styles.statLabel}>โปรตีน</p>
                <p className={styles.statVal}>{client.targetProtein}g</p>
              </div>
            </div>
            <div className={styles.statBox}>
              <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1rem' }}>W</span>
              <div>
                <p className={styles.statLabel}>น้ำหนักเป้า</p>
                <p className={styles.statVal}>{client.targetWeight || '-'} kg</p>
              </div>
            </div>
          </div>
        )}

        {/* Food photo upload button */}
        <Link to="/client/food-photo" className={styles.photoBtn}>
          <Camera size={22} />
          <div>
            <p className={styles.photoBtnTitle}>ส่งรูปอาหารให้เทรนเนอร์</p>
            <p className={styles.photoBtnSub}>ถ่ายหรือเลือกรูปอาหารวันนี้</p>
          </div>
          <ChevronRight size={20} />
        </Link>
      </div>
    </ClientLayout>
  );
}
