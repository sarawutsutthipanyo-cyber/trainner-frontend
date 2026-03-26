import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings')
      .then((res) => setBookings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = {
    pending: '#f59e0b',
    confirmed: '#10b981',
    cancelled: '#ef4444',
    completed: '#6366f1',
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Welcome, {user?.name}</h1>
          <p>Role: <span className={styles.role}>{user?.role}</span></p>
        </div>
      </div>

      <section className={styles.section}>
        <h2>My Bookings</h2>
        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div className={styles.empty}>No bookings yet.</div>
        ) : (
          <div className={styles.bookingList}>
            {bookings.map((b) => (
              <div key={b._id} className={styles.bookingCard}>
                <div>
                  <h4>{b.course?.title || 'Personal Session'}</h4>
                  <p>{new Date(b.scheduledAt).toLocaleString()}</p>
                </div>
                <span
                  className={styles.status}
                  style={{ color: statusColor[b.status] }}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
