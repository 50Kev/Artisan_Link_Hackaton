import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';

export default function Register() {
  // Formulaire states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // 1. Validation : Vérifier si tous les champs sont remplis
    if (!email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    // 2. Validation : Correspondance des mots de passe
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    // 3. Validation : Longueur minimale du mot de passe
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Appel API d'inscription
      await api.post('/auth/register', { email, password });
      
      // En cas de succès, on affiche le message de confirmation
      setSuccessMessage('Inscription réussie ! Veuillez vérifier votre boîte email pour valider votre compte.');
      
      // Réinitialisation des champs du formulaire
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      const apiError = err.response?.data?.message || err.message || "Une erreur est survenue lors de l'inscription.";
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
            Rejoignez notre réseau et proposez vos services à proximité.
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-sm font-medium">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Message de succès */}
        {successMessage && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-emerald-700 text-sm font-medium">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulaire d'Inscription */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Champ Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artisan@exemple.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white text-sm transition-all"
              disabled={isSubmitting || !!successMessage}
            />
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (6 caractères min.)"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white text-sm transition-all"
              disabled={isSubmitting || !!successMessage}
            />
          </div>

          {/* Champ Confirmation Mot de passe */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white text-sm transition-all"
              disabled={isSubmitting || !!successMessage}
            />
          </div>

          {/* Bouton de Soumission */}
          <button
            type="submit"
            disabled={isSubmitting || !!successMessage}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center min-h-[44px] cursor-pointer"
          >
            {isSubmitting ? (
              <div className="scale-75 -my-2">
                <Spinner size="sm" />
              </div>
            ) : (
              "S'inscrire"
            )}
          </button>

        </form>

        {/* Lien de redirection vers la connexion */}
        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}