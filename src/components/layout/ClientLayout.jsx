import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './ClientLayout.module.css';

const navItems = [
  { to: '/client/dashboard', icon: '🏠', label: 'หน้าหลัก' },
  { to: '/client/workout', icon: '🏋️', label: 'ออกกำลังกาย' },
  { to: '/client/meal-plan', icon: '🍽️', label: 'แผนอาหาร' },
  { to: '/client/food', icon: '🍱', label: 'บันทึกอาหาร' },
  { to: '/client/progress', icon: '📈', label: 'วัดผล' },
  { to: '/client/cardio', icon: '🏃', label: 'คาร์ดิโอ' },
];

export default function ClientLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.brand}>💪 TrainerPro</div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.userArea}>
          <span className={styles.userName}>{user?.name}</span>
          <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>ออกจากระบบ</button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
