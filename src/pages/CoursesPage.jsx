import { useEffect, useState } from 'react';
import api from '../api/axios';
import styles from './ListPage.module.css';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then((res) => setCourses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Loading courses...</div>;

  return (
    <div className={styles.container}>
      <h1>Available Courses</h1>
      <p>Browse and enroll in expert-led training programs.</p>
      {courses.length === 0 ? (
        <div className={styles.empty}>No courses available yet.</div>
      ) : (
        <div className={styles.grid}>
          {courses.map((course) => (
            <div key={course._id} className={styles.card}>
              <span className={styles.badge}>{course.category}</span>
              <h3>{course.title}</h3>
              <p className={styles.bio}>{course.description}</p>
              <div className={styles.meta}>
                <span>⏱ {course.duration} min</span>
                <span>${course.price}</span>
              </div>
              <p className={styles.trainerName}>by {course.trainer?.user?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
