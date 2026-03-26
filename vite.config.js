import axios from 'axios';

// ตรวจสอบว่าเป็นเครื่องตัวเองหรือบน Production
const isProduction = import.meta.env.PROD;

const api = axios.create({
  // ถ้าอยู่บน Production ให้ชี้ไปที่ Render ตรงๆ
  // ถ้าอยู่เครื่องตัวเอง ให้ใช้ /api (เพื่อให้ proxy ใน vite.config.js ทำงาน)
  baseURL: isProduction 
    ? 'https://train-backend-zx61.onrender.com/api' 
    : '/api',
});

export default api;