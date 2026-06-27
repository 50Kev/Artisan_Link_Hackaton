import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Lien Accueil */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold tracking-wider hover:text-blue-400 transition-colors">
              Artisan<span className="text-blue-500">Connect</span>
            </Link>
          </div>

          {/* Actions / Liens de Navigation */}
          <div className="flex items-center gap-4">
            {token ? (
              <>
                {/* Liens pour l'utilisateur connecté */}
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium hover:text-blue-400 transition-colors px-3 py-2 rounded-md"
                >
                  Mon espace
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                {/* Liens pour l'utilisateur invité */}
                <Link 
                  to="/login" 
                  className="text-sm font-medium hover:text-blue-400 transition-colors px-3 py-2"
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}