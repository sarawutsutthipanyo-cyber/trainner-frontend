import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home, Dumbbell, ClipboardList, BookOpen, ScanLine,
  TrendingUp, Activity, LogOut, Zap,
} from 'lucide-react';
import styles from './ClientLayout.module.css';

const navItems = [
  { to: '/client/dashboard',    icon: Home,          label: 'หน้าหลัก' },
  { to: '/client/workout',      icon: Dumbbell,      label: 'ออกกำลังกาย' },
  { to: '/client/meal-plan',    icon: ClipboardList, label: 'แผนอาหาร' },
  { to: '/client/food',         icon: BookOpen,      label: 'บันทึกอาหาร' },
  { to: '/client/food-analyzer',icon: ScanLine,      label: 'AI วิเคราะห์' },
  { to: '/client/progress',     icon: TrendingUp,    label: 'วัดผล' },
  { to: '/client/cardio',       icon: Activity,      label: 'คาร์ดิโอ' },
];

export default function ClientLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Zap size={18} strokeWidth={2.5} className={styles.brandIcon} />
          <span>TrainerPro</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <item.icon size={15} strokeWidth={2} />
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.userArea}>
          <div className={styles.avatarBadge}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className={styles.userName}>{user?.name}</span>
          <button
            className={styles.logoutBtn}
            onClick={() => { logout(); navigate('/login'); }}
            title="ออกจากระบบ"
          >
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
