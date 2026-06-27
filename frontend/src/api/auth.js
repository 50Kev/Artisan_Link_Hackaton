import api from './axios';

/**
 * Inscription d'un nouvel utilisateur (ou artisan)
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} Données de réponse de l'API
 */
export const register = async (email, password) => {
  return await api.post('/auth/register', { email, password });
};

/**
 * Connexion de l'utilisateur
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} Données contenant le token et les infos utilisateur
 */
export const login = async (email, password) => {
  return await api.post('/auth/login', { email, password });
};

/**
 * Demande de réinitialisation du mot de passe
 * @param {string} email 
 * @returns {Promise<object>} Message de confirmation de l'API
 */
export const resetPassword = async (email) => {
  return await api.post('/auth/reset-password', { email });
};