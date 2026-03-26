import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, LogOut, Dumbbell, Menu } from 'lucide-react';
import styles from './TrainerLayout.module.css';

const navItems = [
  { to: '/trainer/dashboard', icon: Users, label: 'ลูกเทรน' },
];

export default function TrainerLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.layout}>
      {/* Top bar – visible on mobile only */}
      <div className={styles.topBar}>
        <button className={styles.hamburger} onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <span className={styles.topBarBrand}>TrainerPro</span>
      </div>

      {/* Dark overlay – visible when sidebar is open on mobile */}
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <Dumbbell size={20} strokeWidth={2.5} />
          <span>TrainerPro</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <item.icon size={17} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.userBox}>
          <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user?.name || 'Trainer'}</p>
            <p className={styles.userRole}>Personal Trainer</p>
          </div>
          <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
