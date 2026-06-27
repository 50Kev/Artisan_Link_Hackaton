import React from 'react';
import StarRating from './StarRating';

/**
 * Carte d'affichage individuelle pour un artisan ou un commerce
 * @param {object} props.commerce - Données complètes de la boutique ou du service
 * @param {boolean} props.isOwner - Indique si l'utilisateur connecté gère cette fiche
 * @param {function} props.onViewDetails - Action lors du clic sur "Voir la fiche"
 * @param {function} props.onEdit - Action d'édition (si propriétaire)
 * @param {function} props.onToggleVisibility - Action pour publier ou masquer (si propriétaire)
 */
export default function CommerceCard({ 
  commerce, 
  isOwner = false,
  onViewDetails,
  onEdit,
  onToggleVisibility
}) {
  const {
    id,
    nom,
    categorie,
    telephone,
    adresse,
    note_moyenne,
    photos = [],
    visible
  } = commerce;

  // Gestion de la photo principale ou utilisation d'un placeholder illustratif par défaut
  const mainPhoto = photos.length > 0 ? photos[0] : 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=500&auto=format&fit=crop&q=60';

  // Nettoyage du numéro pour le lien d'API WhatsApp direct
  const cleanPhone = telephone ? String(telephone).replace(/\D/g, '') : '';
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-100 transition-all duration-200 overflow-hidden flex flex-col h-full relative">
      
      {/* Badge indicateur de visibilité publique (uniquement pour le propriétaire) */}
      {isOwner && (
        <span className={`absolute top-3 left-3 z-10 text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md shadow-sm ${
          visible ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
        }`}>
          {visible ? 'En ligne' : 'Masqué (Brouillon)'}
        </span>
      )}

      {/* Zone Image */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden flex-shrink-0">
        <img 
          src={mainPhoto} 
          alt={nom} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Contenu textuel */}
      <div className="p-4 flex flex-col flex-grow">
        
        {/* Catégorie */}
        {categorie && (
          <span className="inline-self-start text-[11px] font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full mb-2 w-max">
            {categorie}
          </span>
        )}

        {/* Nom de l'artisan / commerce */}
        <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1">
          {nom || 'Artisan de confiance'}
        </h3>

        {/* Système de notation par étoiles */}
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating value={note_moyenne || 0} />
          <span className="text-xs font-semibold text-slate-500">
            ({Number(note_moyenne || 0).toFixed(1)})
          </span>
        </div>

        {/* Adresse */}
        {adresse && (
          <p className="text-sm text-slate-600 flex items-start gap-1 mb-4 flex-grow line-clamp-2">
            <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {adresse}
          </p>
        )}

        {/* Actions standard de l'application */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button
            onClick={() => onViewDetails && onViewDetails(id)}
            className="text-center text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2.5 px-3 rounded-lg transition-colors cursor-pointer"
          >
            Voir la fiche
          </button>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-3 rounded-lg transition-colors shadow-sm"
            >
              WhatsApp
            </a>
          ) : (
            <button 
              disabled 
              className="bg-slate-100 text-slate-400 text-xs font-medium py-2.5 px-3 rounded-lg cursor-not-allowed"
            >
              Aucun numéro
            </button>
          )}
        </div>

        {/* Commandes avancées d'administration (Réservées à l'artisan gérant son profil) */}
        {isOwner && (
          <div className="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between gap-2">
            <button
              onClick={() => onEdit && onEdit(commerce)}
              className="text-xs font-semibold text-blue-600 hover:bg-blue-50 py-1.5 px-3 rounded-md border border-transparent hover:border-blue-200 transition-all cursor-pointer"
            >
              Modifier
            </button>
            
            <button
              onClick={() => onToggleVisibility && onToggleVisibility(id, !visible)}
              className={`text-xs font-semibold py-1.5 px-3 rounded-md border transition-all cursor-pointer ${
                visible 
                  ? 'text-amber-600 hover:bg-amber-50 border-transparent hover:border-amber-200' 
                  : 'text-emerald-600 hover:bg-emerald-50 border-transparent hover:border-emerald-200'
              }`}
            >
              {visible ? 'Masquer' : 'Publier'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}