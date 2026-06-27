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

  const [commerce, setCommerce] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [activePhoto, setActivePhoto] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');

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
      if (commerceData?.photos?.length > 0) {
        setActivePhoto(commerceData.photos[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les informations de cet artisan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (id) loadPageData(); }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError('');
    if (!newCommentText.trim()) {
      setCommentError("Écrivez votre avis avant de publier.");
      return;
    }
    try {
      setIsSubmittingComment(true);
      await addCommentaire(id, newCommentText);
      setNewCommentText('');
      const [updatedComments, updatedCommerce] = await Promise.all([
        getCommentaires(id),
        getCommerce(id)
      ]);
      setCommentaires(updatedComments || []);
      setCommerce(updatedCommerce);
    } catch (err) {
      console.error(err);
      setCommentError(err.response?.data?.message || "Erreur lors de l'envoi.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center"><Spinner /></div>
      </div>
    );
  }

  if (error || !commerce) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="max-w-sm mx-auto mt-16 px-4 text-center">
          <p className="text-slate-600 text-sm mb-4">{error || "Cet artisan n'existe pas ou a été masqué."}</p>
          <Link to="/" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const cleanPhone = commerce.telephone ? String(commerce.telephone).replace(/\D/g, '') : '';
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-4xl w-full mx-auto px-4 py-6 flex-grow space-y-4">

        {/* Fil d'ariane */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux résultats
        </Link>

        {/* Layout mobile : colonne unique / desktop : 2 cols */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-4">

            {/* Galerie */}
            {(commerce.photos?.length > 0) && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="h-56 sm:h-80 w-full bg-slate-100 overflow-hidden">
                  <img src={activePhoto} alt={commerce.nom} className="w-full h-full object-cover" />
                </div>
                {commerce.photos.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {commerce.photos.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhoto(url)}
                        className={`h-14 w-18 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          activePhoto === url ? 'border-blue-600' : 'border-transparent opacity-60'
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Infos principales */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div>
                {commerce.categorie && (
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    {commerce.categorie}
                  </span>
                )}
                <h1 className="text-xl font-bold text-slate-900 mt-1">{commerce.nom}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating value={commerce.note_moyenne || 0} size="sm" />
                  <span className="text-xs text-slate-400">{commentaires.length} avis</span>
                </div>
              </div>

              {commerce.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">À propos</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {commerce.description}
                  </p>
                </div>
              )}
            </div>

            {/* Avis */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
              <h2 className="text-sm font-bold text-slate-900">
                Avis ({commentaires.length})
              </h2>

              {/* Formulaire avis */}
              {token ? (
                <form onSubmit={handleCommentSubmit} className="space-y-2">
                  {commentError && (
                    <p className="text-xs text-red-500">{commentError}</p>
                  )}
                  <textarea
                    rows="3"
                    placeholder="Partagez votre expérience avec cet artisan..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                    disabled={isSubmittingComment}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">
                      La note est calculée automatiquement à partir de votre texte.
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors"
                    >
                      {isSubmittingComment ? "Envoi..." : "Publier"}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-slate-500">
                  <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                    Connectez-vous
                  </Link>{' '}
                  pour laisser un avis.
                </p>
              )}

              {/* Liste avis */}
              <div className="space-y-4 divide-y divide-slate-100">
                {commentaires.length === 0 ? (
                  <p className="text-sm text-slate-400 py-2">Aucun avis pour l'instant. Soyez le premier.</p>
                ) : (
                  commentaires.map((comment) => (
                    <div key={comment.id} className="pt-4 first:pt-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <StarRating value={comment.note_ia || comment.note || 5} size="sm" />
                        <span className="text-xs text-slate-400">
                          {comment.created_at
                            ? new Date(comment.created_at).toLocaleDateString('fr-FR')
                            : 'Récemment'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{comment.texte}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Sidebar contact — sticky sur desktop, inline sur mobile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 lg:sticky lg:top-20">
              <h3 className="text-sm font-bold text-slate-900">Contact & infos</h3>

              <div className="space-y-3 text-sm">
                {commerce.adresse && (
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-slate-600">{commerce.adresse}</span>
                  </div>
                )}

                {commerce.horaires && (
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-slate-600">{commerce.horaires}</span>
                  </div>
                )}

                {commerce.telephone && (
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-slate-600">{commerce.telephone}</span>
                  </div>
                )}
              </div>

              {/* Bouton WhatsApp */}
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl text-sm text-center flex items-center justify-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contacter sur WhatsApp
                </a>
              ) : (
                <button disabled className="w-full bg-slate-100 text-slate-400 py-3 px-4 rounded-xl text-sm cursor-not-allowed">
                  Aucun numéro renseigné
                </button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
