import React from 'react';

/**
 * Composant de chargement réutilisable (Spinner)
 * @param {string} props.size - Taille du spinner : 'sm', 'md', ou 'lg' (défaut: 'md')
 */
export default function Spinner({ size = 'md' }) {
  // Définition des correspondances de tailles pour le cercle
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4'
  };

  // Sélection de la classe de taille appropriée, avec repli sur la taille moyenne
  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex items-center justify-center w-full p-4">
      <div
        className={`${selectedSize} animate-spin rounded-full border-blue-500 border-t-transparent`}
        role="status"
        aria-label="Chargement"
      ></div>
    </div>
  );
}