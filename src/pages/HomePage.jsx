import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1>Find Your Perfect Trainer</h1>
        <p>Connect with expert trainers, book sessions, and reach your goals faster.</p>
        <div className={styles.heroActions}>
          <Link to="/trainers" className={styles.btnPrimary}>Browse Trainers</Link>
          <Link to="/courses" className={styles.btnSecondary}>Explore Courses</Link>
        </div>
      </section>

      <section className={styles.features}>
        {[
          { icon: '🏋️', title: 'Expert Trainers', desc: 'Verified professionals across all fitness disciplines.' },
          { icon: '📅', title: 'Easy Booking', desc: 'Schedule sessions that fit your lifestyle.' },
          { icon: '🎯', title: 'Personalized Plans', desc: 'Get training tailored to your specific goals.' },
        ].map((f) => (
          <div key={f.title} className={styles.card}>
            <span className={styles.icon}>{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
