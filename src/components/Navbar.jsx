import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <Link to="/">TrainerPlatform</Link>
      </div>
      <div className={styles.links}>
        <Link to="/trainers">Trainers</Link>
        <Link to="/courses">Courses</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout} className={styles.btnOutline}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.btnOutline}>Login</Link>
            <Link to="/register" className={styles.btnPrimary}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
