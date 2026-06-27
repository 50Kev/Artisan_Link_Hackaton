import React from 'react';
import StarRating from './StarRating';

export default function CommerceCard({
  commerce,
  isOwner = false,
  onViewDetails,
  onEdit,
  onToggleVisibility
}) {
  const { id, nom, categorie, telephone, adresse, note_moyenne, photos = [], visible } = commerce;

  const mainPhoto = photos.length > 0
    ? photos[0]
    : null;

  const cleanPhone = telephone ? String(telephone).replace(/\D/g, '') : '';
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-full transition-shadow hover:shadow-md">

      {/* Badge propriétaire */}
      {isOwner && (
        <div className={`text-[10px] font-semibold text-center py-1 ${
          visible ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {visible ? 'Publié' : 'Brouillon'}
        </div>
      )}

      {/* Image */}
      <div className="h-40 w-full bg-slate-100 flex-shrink-0 overflow-hidden">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={nom}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3" />
            </svg>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4 flex flex-col flex-grow">
        {categorie && (
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide mb-1">
            {categorie}
          </span>
        )}

        <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
          {nom || 'Artisan local'}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <StarRating value={note_moyenne || 0} />
          <span className="text-xs text-slate-400 ml-0.5">
            {Number(note_moyenne || 0).toFixed(1)}
          </span>
        </div>

        {adresse && (
          <p className="text-xs text-slate-500 line-clamp-1 mb-4 flex-grow">
            {adresse}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onViewDetails && onViewDetails(id)}
            className="flex-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2.5 rounded-lg transition-colors"
          >
            Voir la fiche
          </button>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          ) : (
            <button disabled className="flex-1 bg-slate-50 text-slate-300 text-xs py-2.5 rounded-lg border border-slate-100 cursor-not-allowed">
              Pas de contact
            </button>
          )}
        </div>

        {/* Actions propriétaire */}
        {isOwner && (
          <div className="border-t border-slate-100 mt-3 pt-3 flex gap-2">
            <button
              onClick={() => onEdit && onEdit(commerce)}
              className="flex-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={() => onToggleVisibility && onToggleVisibility(id, !visible)}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${
                visible
                  ? 'text-amber-600 hover:bg-amber-50'
                  : 'text-emerald-600 hover:bg-emerald-50'
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
