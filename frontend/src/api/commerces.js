import api from './axios';

// L'interceptor axios retourne déjà res.data (= { success, data })
// Donc on accède à .data pour récupérer le payload réel

export const getCommerces = async (params) => {
  const res = await api.get('/commerces', { params });
  return res.data; // res = { success, data: [...] } → res.data = [...]
};

export const getCommerce = async (id) => {
  const res = await api.get(`/commerces/${id}`);
  return res.data;
};

export const createCommerce = async (data) => {
  const res = await api.post('/commerces', data);
  return res.data; // renvoie l'objet commerce créé
};

export const updateCommerce = async (id, data) => {
  const res = await api.put(`/commerces/${id}`, data);
  return res.data;
};

// PATCH (et non POST) pour publish/unpublish
export const publishCommerce = async (id) => {
  const res = await api.patch(`/commerces/${id}/publish`);
  return res.data;
};

export const unpublishCommerce = async (id) => {
  const res = await api.patch(`/commerces/${id}/unpublish`);
  return res.data;
};

// Endpoint correct : /photos (pluriel)
export const uploadPhoto = async (id, file) => {
  const formData = new FormData();
  formData.append('photo', file);
  const res = await api.post(`/commerces/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getCommentaires = async (id) => {
  const res = await api.get(`/commerces/${id}/commentaires`);
  return res.data;
};

export const addCommentaire = async (id, texte) => {
  const res = await api.post(`/commerces/${id}/commentaires`, { texte });
  return res.data;
};
