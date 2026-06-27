import axios from 'axios';

const api = axios.create({
  // VITE_API_URL doit inclure /api en production
  // Ex: https://monbackend.railway.app/api
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Injecter le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Format réponse uniforme : retourne res.data ({ success, data, ... })
api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err)
);

export default api;
