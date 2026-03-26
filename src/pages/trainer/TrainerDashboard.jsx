import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyClients } from '../../api';
import TrainerLayout from '../../components/layout/TrainerLayout';
import { Users, Flame, Dumbbell, ChevronRight, UserPlus, Scale } from 'lucide-react';
import styles from './TrainerDashboard.module.css';

const goalLabel = { lose_weight: 'ลดน้ำหนัก', gain_muscle: 'เพิ่มกล้าม', maintain: 'รักษาน้ำหนัก' };
const goalColor = { lose_weight: '#ef4444', gain_muscle: '#6366f1', maintain: '#10b981' };
const GoalIcon = { lose_weight: Flame, gain_muscle: Dumbbell, maintain: Scale };

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyClients().then((r) => setClients(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: clients.length,
    loseWeight: clients.filter((c) => c.goal === 'lose_weight').length,
    gainMuscle: clients.filter((c) => c.goal === 'gain_muscle').length,
  };

  return (
    <TrainerLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>สวัสดี, {user?.name}</h1>
            <p>ภาพรวมลูกเทรนทั้งหมด</p>
          </div>
          <Link to="/trainer/clients/new" className="btn btn-primary">
            <UserPlus size={16} strokeWidth={2} /> เพิ่มลูกเทรน
          </Link>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <p className="stat-label">ลูกเทรนทั้งหมด</p>
            <p className="stat-value">{stats.total} <span className="stat-unit">คน</span></p>
          </div>
          <div className="stat-card">
            <p className="stat-label">ลดน้ำหนัก</p>
            <p className="stat-value" style={{ color: '#ef4444' }}>{stats.loseWeight} <span className="stat-unit">คน</span></p>
          </div>
          <div className="stat-card">
            <p className="stat-label">เพิ่มกล้าม</p>
            <p className="stat-value" style={{ color: '#6366f1' }}>{stats.gainMuscle} <span className="stat-unit">คน</span></p>
          </div>
        </div>

        <div className={styles.section}>
          <h2>รายชื่อลูกเทรน</h2>
          {loading ? (
            <div className="loading">กำลังโหลด...</div>
          ) : clients.length === 0 ? (
            <div className="card empty-state">
              <Users size={40} strokeWidth={1.5} style={{ color: 'var(--muted)', marginBottom: '0.75rem' }} />
              <p>ยังไม่มีลูกเทรน</p>
              <Link to="/trainer/clients/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <UserPlus size={16} strokeWidth={2} /> เพิ่มลูกเทรนคนแรก
              </Link>
            </div>
          ) : (
            <div className={styles.clientGrid}>
              {clients.map((c) => {
                const Icon = GoalIcon[c.goal] || Dumbbell;
                return (
                  <Link to={`/trainer/clients/${c.id}`} key={c.id} className={styles.clientCard}>
                    <div className={styles.clientAvatar}>{c.user?.name?.charAt(0).toUpperCase()}</div>
                    <div className={styles.clientInfo}>
                      <h3>{c.user?.name}</h3>
                      <span className="badge" style={{ background: goalColor[c.goal] + '18', color: goalColor[c.goal], display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Icon size={12} strokeWidth={2.5} />
                        {goalLabel[c.goal]}
                      </span>
                    </div>
                    <div className={styles.clientStats}>
                      <div>
                        <p className={styles.statLabel}>น้ำหนัก</p>
                        <p className={styles.statVal}>{c.currentWeight} <span>kg</span></p>
                      </div>
                      <div>
                        <p className={styles.statLabel}>เป้าหมาย</p>
                        <p className={styles.statVal}>{c.targetWeight || '-'} <span>kg</span></p>
                      </div>
                      <div>
                        <p className={styles.statLabel}>แคล/วัน</p>
                        <p className={styles.statVal}>{Math.round(c.targetCalories || 0)} <span>kcal</span></p>
                      </div>
                    </div>
                    <ChevronRight size={18} className={styles.arrow} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </TrainerLayout>
  );
}
