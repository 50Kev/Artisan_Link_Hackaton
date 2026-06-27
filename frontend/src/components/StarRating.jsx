import React, { useState } from 'react';

/**
 * Composant de notation à base d'étoiles (Affichage et Interactif)
 * @param {number} props.value - La note actuelle (ex: 4.2)
 * @param {function} props.onRate - Callback optionnel. Si fourni, active le mode interactif.
 * @param {string} props.size - Taille des étoiles : 'sm', 'md', ou 'lg' (défaut : 'md')
 */
export default function StarRating({ 
  value = 0, 
  onRate = null, 
  size = 'md' 
}) {
  const [hoverValue, setHoverValue] = useState(null);

  // Mode interactif actif uniquement si la fonction onRate est transmise
  const isInteractive = typeof onRate === 'function';

  // Configuration des tailles d'icônes avec les classes Tailwind
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base'
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  // Calculer l'état de remplissage de l'étoile (indice de 1 à 5)
  const getStarType = (index) => {
    // Si on survole en mode interactif, on prend la valeur survolée
    const activeValue = hoverValue !== null ? hoverValue : value;
    
    if (activeValue >= index) {
      return 'full';
    } else if (activeValue >= index - 0.5 && !isInteractive) {
      // Étoile de demi-remplissage (uniquement pour l'affichage statique des moyennes décimales)
      return 'half';
    }
    return 'empty';
  };

  return (
    <div className="flex items-center gap-2 select-none">
      <div 
        className="flex items-center"
        onMouseLeave={() => isInteractive && setHoverValue(null)}
      >
        {[1, 2, 3, 4, 5].map((index) => {
          const starType = getStarType(index);

          return (
            <button
              key={index}
              type="button"
              disabled={!isInteractive}
              onClick={() => isInteractive && onRate(index)}
              onMouseEnter={() => isInteractive && setHoverValue(index)}
              className={`${isInteractive ? 'cursor-pointer transition-transform active:scale-90' : 'cursor-default'} focus:outline-none p-0.5`}
            >
              {starType === 'full' && (
                <svg className={`${currentSizeClass} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}

              {starType === 'half' && (
                <div className="relative">
                  <svg className={`${currentSizeClass} text-gray-300`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                    <svg className={`${currentSizeClass} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              )}

              {starType === 'empty' && (
                <svg className={`${currentSizeClass} text-gray-300 transition-colors duration-150`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Note numérique à côté */}
      <span className={`font-bold text-slate-700 ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}`}>
        {hoverValue !== null ? hoverValue.toFixed(0) : Number(value).toFixed(1)}/5
      </span>
    </div>
  );
}