import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        <Link to="/" className="text-base font-bold text-slate-900 tracking-tight">
          SongTaaba<span className="text-blue-600">-Market</span>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          {token ? (
            <>
              <Link
                to="/dashboard"
                className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'text-blue-600 bg-blue-50 font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Mon espace
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {token ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block text-sm text-slate-700 font-medium py-2.5 px-3 rounded-lg hover:bg-slate-50"
              >
                Mon espace
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left text-sm text-slate-500 py-2.5 px-3 rounded-lg hover:bg-slate-50"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-sm text-slate-700 py-2.5 px-3 rounded-lg hover:bg-slate-50"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block text-sm text-blue-600 font-medium py-2.5 px-3 rounded-lg hover:bg-blue-50"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
