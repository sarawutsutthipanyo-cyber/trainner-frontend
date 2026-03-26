import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, uploadFoodPhoto, getFoodPhotos } from '../../api';
import { Camera, ArrowLeft } from 'lucide-react';
import styles from './FoodPhotoUpload.module.css';

const MEALS = ['breakfast','lunch','dinner','snack','other'];
const MEAL_TH = { breakfast:'มื้อเช้า', lunch:'มื้อกลางวัน', dinner:'มื้อเย็น', snack:'ของว่าง', other:'อื่นๆ' };
const todayStr = new Date().toISOString().split('T')[0];

export default function FoodPhotoUpload() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [mealType, setMealType] = useState('other');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getMyProfile().then(async (r) => {
      setClient(r.data);
      const p = await getFoodPhotos(r.data.id);
      setPhotos(p.data);
    }).catch(console.error);
  }, []);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file || !client) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      fd.append('mealType', mealType);
      fd.append('date', todayStr);
      fd.append('notes', notes);
      const r = await uploadFoodPhoto(fd);
      setPhotos((prev) => [r.data, ...prev]);
      setFile(null); setPreview(null); setNotes('');
    } catch (err) { console.error(err); alert('อัปโหลดไม่สำเร็จ'); }
    finally { setUploading(false); }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/client/dashboard')}>
          <ArrowLeft size={16} /> กลับ
        </button>
        <h1>ส่งรูปอาหาร</h1>
      </header>

      <div className={styles.content}>
        {/* Upload area */}
        <div className={styles.uploadSection}>
          {preview ? (
            <div className={styles.previewWrap}>
              <img src={preview} alt="preview" className={styles.preview} />
              <button className={styles.removePreview} onClick={() => { setPreview(null); setFile(null); }}>✕ เลือกใหม่</button>
            </div>
          ) : (
            <label className={styles.uploadBox}>
              <Camera size={36} strokeWidth={1.5} />
              <p>ถ่ายรูปหรือเลือกจากคลัง</p>
              <input type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
            </label>
          )}

          <div className={styles.form}>
            <div className="form-group">
              <label>มื้ออาหาร</label>
              <select className="form-control" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                {MEALS.map((m) => <option key={m} value={m}>{MEAL_TH[m]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>หมายเหตุ (ไม่บังคับ)</label>
              <input className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="เช่น กินข้าวกลางวันที่ออฟฟิศ" />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? 'กำลังส่ง...' : <><Camera size={16} /> ส่งรูปให้เทรนเนอร์</>}
            </button>
          </div>
        </div>

        {/* Photo history */}
        {photos.length > 0 && (
          <div className={styles.history}>
            <h3>รูปที่ส่งแล้ว</h3>
            <div className={styles.photoGrid}>
              {photos.map((p) => (
                <div key={p.id} className={styles.photoCard}>
                  <img src={p.photoUrl} alt="food" className={styles.photoImg} />
                  <div className={styles.photoMeta}>
                    <span>{MEAL_TH[p.mealType]}</span>
                    <span>{new Date(p.createdAt).toLocaleDateString('th-TH', { month:'short', day:'numeric' })}</span>
                  </div>
                  {p.notes && <p className={styles.photoNotes}>{p.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
