import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

/**
 * Composant de protection des routes de l'application
 * Redirige les utilisateurs non authentifiés vers la page de connexion
 */
export default function PrivateRoute({ children }) {
  const { token, isLoading } = useAuth();
  const location = useLocation();

  // Affichage du spinner pendant la récupération ou la vérification du token au montage
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-500 text-sm font-medium animate-pulse">
          Vérification de la session...
        </p>
      </div>
    );
  }

  // Si aucun token n'est trouvé, redirection vers /login
  // state={{ from: location }} permet de conserver l'historique pour une redirection post-connexion
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est authentifié, on affiche le contenu protégé
  return children;
}