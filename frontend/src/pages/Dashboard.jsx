import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CommerceCard from '../components/CommerceCard';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { getCommerces, publishCommerce, unpublishCommerce } from '../api/commerces';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [myCommerces, setMyCommerces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');

  const loadUserCommerces = async () => {
    try {
      setIsLoading(true);
      setError('');
      // Le backend retourne tous les commerces ; on filtre côté client par user_id
      const allCommerces = await getCommerces();
      const mine = (allCommerces || []).filter(c => c.user_id === user?.id);
      setMyCommerces(mine);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger vos commerces pour le moment.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadUserCommerces();
    }
  }, [user]);

  const handleToggleVisibility = async (id, shouldPublish) => {
    try {
      setActionLoadingId(id);
      setError('');
      if (shouldPublish) {
        await publishCommerce(id);
      } else {
        await unpublishCommerce(id);
      }
      setMyCommerces(prev =>
        prev.map(item => item.id === id ? { ...item, visible: shouldPublish } : item)
      );
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la modification de la visibilité du commerce.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEditCommerce = (commerce) => {
    navigate(`/commerces/edit/${commerce.id}`, { state: { commerce } });
  };

  const handleViewDetails = (id) => {
    navigate(`/commerce/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Mon Espace Artisan
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Gérez vos vitrines, mettez à jour vos coordonnées et suivez vos publications.
            </p>
          </div>

          <Link
            to="/commerces/new"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-sm transition-colors cursor-pointer w-full sm:w-auto text-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un commerce
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-20">
            <Spinner size="lg" />
            <p className="text-center text-sm text-slate-500 font-medium mt-3 animate-pulse">
              Chargement de vos établissements...
            </p>
          </div>
        ) : myCommerces.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 max-w-xl mx-auto shadow-sm mt-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Vous n'avez créé aucune fiche</h3>
            <p className="text-slate-500 text-sm mt-2 mb-6">
              Pour apparaître sur la carte interactive et permettre aux clients de vous contacter via WhatsApp, créez dès maintenant le profil de votre activité.
            </p>
            <Link
              to="/commerces/new"
              className="inline-flex bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm"
            >
              Créer ma première vitrine
            </Link>
          </div>
        ) : (
          <div className="relative">
            {actionLoadingId && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl" />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myCommerces.map((commerce) => (
                <CommerceCard
                  key={commerce.id}
                  commerce={commerce}
                  isOwner={true}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEditCommerce}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
