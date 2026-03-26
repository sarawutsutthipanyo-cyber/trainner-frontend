import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell } from 'lucide-react';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      navigate(user.role === 'user' ? '/client/dashboard' : '/trainer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.bg}>
      <div className={styles.card}>
        <div className={styles.logo}><Dumbbell size={36} strokeWidth={2} style={{ color: 'var(--primary)' }} /></div>
        <h2>TrainerPro</h2>
        <p>เข้าสู่ระบบเพื่อเริ่มต้น</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label>ชื่อผู้ใช้</label>
            <input className="form-control" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required placeholder="ชื่อ หรืออีเมล" autoComplete="username" />
          </div>
          <div className="form-group">
            <label>รหัสผ่าน</label>
            <input className="form-control" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

      </div>
    </div>
  );
}
