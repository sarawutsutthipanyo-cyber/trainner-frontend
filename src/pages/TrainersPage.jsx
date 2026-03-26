import { useEffect, useState } from 'react';
import api from '../api/axios';
import styles from './ListPage.module.css';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trainers')
      .then((res) => setTrainers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Loading trainers...</div>;

  return (
    <div className={styles.container}>
      <h1>Our Trainers</h1>
      <p>Find certified professionals to guide your journey.</p>
      {trainers.length === 0 ? (
        <div className={styles.empty}>No trainers available yet.</div>
      ) : (
        <div className={styles.grid}>
          {trainers.map((trainer) => (
            <div key={trainer._id} className={styles.card}>
              <div className={styles.avatar}>
                {trainer.user?.name?.charAt(0).toUpperCase()}
              </div>
              <h3>{trainer.user?.name}</h3>
              <p className={styles.specialty}>{trainer.specialties?.join(', ')}</p>
              <p className={styles.bio}>{trainer.bio || 'No bio available.'}</p>
              <div className={styles.meta}>
                <span>⭐ {trainer.rating?.toFixed(1)} ({trainer.totalReviews} reviews)</span>
                <span>${trainer.pricePerHour}/hr</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
