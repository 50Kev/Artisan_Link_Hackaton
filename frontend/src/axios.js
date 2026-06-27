// frontend/src/axios.js
import axios from 'axios';

// Configuration UNIQUEMENT pour le frontend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001', // Pointe vers VOTRE backend existant
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajoute automatiquement le token d'authentification (depuis localStorage)
// Cela ne touche AUCUNEMENT à votre backend - c'est juste une header HTTP
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Gère les erreurs 401 (token expiré) en nettoyant le localStorage
// Ceci est purement frontend - votre backend renvoie déjà 401 correctement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // Optionnel : déclenche un événement pour rafraîchir l'UI si vous en avez besoin
      // window.dispatchEvent(new Event('authLogout'));
    }
    return Promise.reject(error);
  }
);

export default api;
