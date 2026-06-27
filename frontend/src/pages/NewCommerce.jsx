import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import { createCommerce, uploadPhoto } from '../api/commerces';

const CATEGORIES = [
  "Menuisier", "Mécanicien", "Coiffeur", "Couturier",
  "Électricien", "Plombier", "Maçon", "Boulanger",
  "Soudeur", "Photographe", "Réparateur téléphone",
];

export default function NewCommerce() {
  const navigate = useNavigate();

  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState('');
  const [description, setDescription] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [horaires, setHoraires] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [gpsSuccess, setGpsSuccess] = useState(false);

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setIsLocating(true);
    setGpsSuccess(false);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setGpsSuccess(true);
        setIsLocating(false);
      },
      () => {
        setError("Impossible de récupérer votre position GPS.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 3) {
      setError("Vous ne pouvez pas ajouter plus de 3 photos.");
      return;
    }
    setError('');
    setSelectedFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e, isVisible) => {
    e.preventDefault();
    setError('');

    if (!nom || !categorie || !telephone || !adresse) {
      setError("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }
    if (!lat || !lng) {
      setError("Veuillez capturer vos coordonnées GPS à l'aide du bouton 'Ma position GPS'.");
      return;
    }

    try {
      setIsSubmitting(true);

      const commercePayload = { nom, categorie, description, telephone, adresse, horaires, lat, lng, visible: isVisible };

      // createCommerce retourne l'objet commerce (res.data depuis l'interceptor)
      const result = await createCommerce(commercePayload);
      // Selon la double-interprétation de l'interceptor axios :
      // interceptor: res → res.data = { success, data: {...} }
      // createCommerce: res → res.data = l'objet commerce directement
      // On couvre les deux cas pour robustesse
      const commerceId = result?.id || result?.data?.id;
      console.log('[NewCommerce] result:', result, '→ commerceId:', commerceId);

      if (selectedFiles.length > 0 && commerceId) {
        for (const file of selectedFiles) {
          await uploadPhoto(commerceId, file);
        }
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.error || err.message || "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex-grow">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ajouter une Vitrine</h1>
            <p className="text-slate-500 text-sm mt-1">
              Remplissez les informations ci-dessous pour rendre vos services accessibles sur notre carte interactive.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">Nom de l'activité *</label>
                <input type="text" required placeholder="Ex: Menuiserie du Centre" value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">Catégorie *</label>
                <select required value={categorie} onChange={(e) => setCategorie(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">Sélectionner un secteur</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">Description des prestations</label>
              <textarea rows="3" placeholder="Présentez brièvement vos compétences..." value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">N° Téléphone WhatsApp *</label>
                <input type="tel" required placeholder="Ex: +22670000000" value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">Horaires d'ouverture</label>
                <input type="text" placeholder="Ex: Lun - Sam: 8h00 - 18h00" value={horaires}
                  onChange={(e) => setHoraires(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">Adresse physique / Quartier *</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" required placeholder="Ex: Secteur 23, Route de Pô, Ouagadougou" value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full flex-grow px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <button type="button" onClick={handleGetGPS} disabled={isLocating}
                  className={`px-4 py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    gpsSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  }`}
                >
                  {isLocating ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : gpsSuccess ? "✓ Position Capturée" : "Ma position GPS"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
                Photos de vos réalisations ou atelier (Max 3)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {previews.map((url, index) => (
                  <div key={url} className="relative h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-sm hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {previews.length < 3 && (
                  <label className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors p-2 text-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-[10px] text-slate-500 font-bold mt-1">Ajouter</span>
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button type="button" onClick={(e) => handleSubmit(e, false)} disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer text-center"
              >
                Enregistrer brouillon
              </button>
              <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center min-h-[44px] cursor-pointer"
              >
                {isSubmitting ? <Spinner size="sm" /> : "Publier ma vitrine"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
