import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Formulaire states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupération de la page d'origine s'il y a eu redirection par PrivateRoute
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation basique
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      // Redirection après connexion réussie
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      // Extraction du message d'erreur renvoyé par l'API ou message par défaut
      const apiError = err.response?.data?.message || err.message || "Identifiants invalides ou problème de connexion.";
      setError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      
      {/* Conteneur du Formulaire */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        
        {/* En-tête / Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-extrabold tracking-wider text-slate-900">
            Artisan<span className="text-blue-600">Connect</span>
          </Link>
          <p className="text-slate-500 text-sm mt-2">
            Ravi de vous revoir ! Connectez-vous à votre espace.
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-sm font-medium animate-shake">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire de Connexion */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Champ Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artisan@exemple.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white text-sm transition-all"
              disabled={isSubmitting}
            />
          </div>

          {/* Champ Mot de passe */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-slate-700">
                Mot de passe
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white text-sm transition-all"
              disabled={isSubmitting}
            />
          </div>

          {/* Bouton de Soumission */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center min-h-[44px] cursor-pointer"
          >
            {isSubmitting ? (
              <div className="scale-75 -my-2">
                <Spinner size="sm" />
              </div>
            ) : (
              "Se connecter"
            )}
          </button>

        </form>

        {/* Lien de redirection vers l'inscription */}
        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600">
            Nouveau sur la plateforme ?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
