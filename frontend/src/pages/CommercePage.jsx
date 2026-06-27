import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { getCommerce, getCommentaires, addCommentaire } from '../api/commerces';

export default function CommercePage() {
  const { id } = useParams();
  const { token } = useAuth();

  // États des données
  const [commerce, setCommerce] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [activePhoto, setActivePhoto] = useState('');

  // États d'UI et de soumission
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');

  // Chargement conjoint des détails du commerce et des commentaires
  const loadPageData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const [commerceData, commentairesData] = await Promise.all([
        getCommerce(id),
        getCommentaires(id)
      ]);

      setCommerce(commerceData);
      setCommentaires(commentairesData || []);

      // Définir la photo principale par défaut
      if (commerceData?.photos && commerceData.photos.length > 0) {
        setActivePhoto(commerceData.photos[0]);
      } else {
        setActivePhoto('https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&auto=format&fit=crop&q=80');
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les informations de cet artisan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadPageData();
    }
  }, [id]);

  // Soumission d'un nouvel avis
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError('');

    if (!newCommentText.trim()) {
      setCommentError("Le texte du commentaire ne peut pas être vide.");
      return;
    }

    try {
      setIsSubmittingComment(true);
      
      // Envoi du commentaire au backend (l'IA analyse le texte et calcule la note)
      await addCommentaire(id, newCommentText);
      
      // Réinitialisation du formulaire et rechargement des avis mis à jour
      setNewCommentText('');
      const updatedComments = await getCommentaires(id);
      setCommentaires(updatedComments || []);
      
      // Optionnel : Recharger aussi le commerce pour mettre à jour la note_moyenne globale
      const updatedCommerce = await getCommerce(id);
      setCommerce(updatedCommerce);
    } catch (err) {
      console.error(err);
      setCommentError(err.response?.data?.message || "Erreur lors de l'envoi de votre avis.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !commerce) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="max-w-md mx-auto mt-16 px-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-red-600 font-medium">{error || "Cet artisan n'existe pas ou a été masqué."}</p>
            <Link to="/" className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Nettoyage et préparation du bouton d'appel direct WhatsApp
  const cleanPhone = commerce.telephone ? String(commerce.telephone).replace(/\D/g, '') : '';
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ─── BLOC GAUCHE & CENTRAL : VITRINE & INFOS (2 COLONNES SUR LARGE) ─── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section Galerie Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 overflow-hidden">
            <div className="h-64 sm:h-96 w-full rounded-xl bg-slate-100 overflow-hidden mb-3">
              <img src={activePhoto} alt={commerce.nom} className="w-full h-full object-cover" />
            </div>
            
            {/* Miniatures cliquables (si plusieurs photos disponibles) */}
            {commerce.photos && commerce.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {commerce.photos.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhoto(imgUrl)}
                    className={`h-16 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      activePhoto === imgUrl ? 'border-blue-600 scale-95' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={imgUrl} alt="Miniature" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Corps : Nom, Catégorie et Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  {commerce.categorie}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                  {commerce.nom}
                </h1>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <StarRating value={commerce.note_moyenne || 0} size="sm" />
                <span className="text-xs text-slate-500 font-bold">
                  ({commentaires.length} avis)
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Description du savoir-faire</h2>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {commerce.description || "Cet artisan n'a pas encore rédigé de description détaillée, mais reste pleinement joignable pour toute demande de devis ou d'intervention."}
              </p>
            </div>
          </div>

          {/* ─── SECTION COMMENTAIRES & ANALYSE IA ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Avis Clients &amp; Évaluations ({commentaires.length})
            </h2>

            {/* Formulaire d'ajout conditionnel */}
            {token ? (
              <form onSubmit={handleCommentSubmit} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <label htmlFor="commentText" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Donnez votre avis (Notation automatique par IA)
                </label>
                
                {commentError && (
                  <p className="text-xs text-red-600 font-semibold">{commentError}</p>
                )}

                <div className="relative">
                  <textarea
                    id="commentText" rows="3" required
                    placeholder="Racontez votre expérience... Notre système analysera votre texte pour générer automatiquement les étoiles correspondantes."
                    value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 transition-all resize-none"
                    disabled={isSubmittingComment}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 100-2h-1a1 1 0 100 2h1zM5.05 6.464a1 1 0 10-1.414-1.414l.707-.707a1 1 0 001.414 1.414l-.707.707zM5 10a1 1 0 100-2H4a1 1 0 100 2h1zM8 16v-1a1 1 0 10-2 0v1a1 1 0 102 0zM12A4 4 0 118 8a4 4 0 014 0z" /></svg>
                    Modération et analyse d'étoiles par IA
                  </span>
                  
                  <button
                    type="submit" disabled={isSubmittingComment}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
                  >
                    {isSubmittingComment ? "Analyse en cours..." : "Publier mon avis"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-blue-50/50 border border-dashed border-blue-200 rounded-xl p-4 text-center">
                <p className="text-sm text-slate-600">
                  Vous souhaitez partager votre expérience avec cet artisan ?{' '}
                  <Link to="/login" className="font-bold text-blue-600 hover:underline">
                    Connectez-vous pour laisser un avis
                  </Link>
                </p>
              </div>
            )}

            {/* Liste des avis postés */}
            <div className="space-y-4">
              {commentaires.length === 0 ? (
                <p className="text-center text-sm text-slate-400 italic py-4">
                  Aucun commentaire pour le moment. Soyez le premier à donner votre avis !
                </p>
              ) : (
                commentaires.map((comment) => (
                  <div key={comment.id} className="border-b border-slate-100 last:border-none pb-4 last:pb-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      {/* Note générée / validée par l'IA */}
                      <div className="flex items-center gap-2">
                        <StarRating value={comment.note_ia || comment.note || 5} size="sm" />
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-bold border border-amber-100 px-1.5 py-0.5 rounded">
                          Score IA
                        </span>
                      </div>
                      
                      {/* Date de dépôt */}
                      <span className="text-xs text-slate-400">
                        {comment.created_at ? new Date(comment.created_at).toLocaleDateString('fr-FR') : 'Récemment'}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm pl-0.5 leading-relaxed">
                      {comment.texte}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* ─── BLOC DROIT : ENCART CONTACT & COORDONNÉES (1 COLONNE DE SIDEBAR) ─── */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24 space-y-5">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Informations Pratiques
            </h3>

            {/* Coordonnées */}
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-slate-800">Localisation</h4>
                  <p className="text-slate-600 mt-0.5">{commerce.adresse}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-slate-800">Disponibilités &amp; Horaires</h4>
                  <p className="text-slate-600 mt-0.5">{commerce.horaires || "Non spécifiés (Contactez l'artisan)"}</p>
                </div>
              </div>
            </div>

            {/* Grand bouton vert d'action WhatsApp */}
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm text-center flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                {/* Icône SVG intégrée */}
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Discuter sur WhatsApp
              </a>
            ) : (
              <button disabled className="w-full bg-slate-100 text-slate-400 py-3.5 px-4 rounded-xl font-medium cursor-not-allowed text-center text-sm">
                Aucun numéro fourni
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}