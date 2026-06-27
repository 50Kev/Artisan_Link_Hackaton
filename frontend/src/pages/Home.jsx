import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import CommerceCard from '../components/CommerceCard';
import Spinner from '../components/Spinner';
import { getCommerces } from '../api/commerces';

const CATEGORIES = [
  "Menuisier", "Mécanicien", "Coiffeur", "Couturier",
  "Électricien", "Plombier", "Maçon", "Boulanger",
  "Soudeur", "Photographe", "Réparateur téléphone",
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [commerces, setCommerces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([12.2383, -1.5616]);
  const [mapKey, setMapKey] = useState(0);

  const fetchArtisans = async (filters = {}) => {
    try {
      setIsLoading(true);
      const data = await getCommerces(filters);
      setCommerces(data || []);
      setMapKey(k => k + 1);
    } catch (error) {
      console.error("Erreur lors de la récupération des commerces :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setMapCenter([coords.latitude, coords.longitude]);
          fetchArtisans({ lat: coords.latitude, lng: coords.longitude, radius: 50 });
        },
        () => fetchArtisans()
      );
    } else {
      fetchArtisans();
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (selectedCategory) params.categorie = selectedCategory;
    fetchArtisans(params);
  };

  const handleGeolocateMe = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setMapCenter([coords.latitude, coords.longitude]);
          fetchArtisans({ lat: coords.latitude, lng: coords.longitude, radius: 50 });
        },
        () => setIsLoading(false)
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* HERO — sobre, pas d'emojis */}
      <section className="bg-slate-900 text-white px-4 pt-12 pb-24">
        <div className="max-w-lg mx-auto text-center space-y-3">
          <p className="text-xs font-medium tracking-widest uppercase text-slate-400">
            Ouagadougou & environs
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-snug text-white">
            Trouvez l'artisan<br />
            <span className="text-blue-400">qu'il vous faut.</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            Menuisiers, coiffeurs, mécaniciens — contactez directement les professionnels de votre quartier par WhatsApp.
          </p>
        </div>
      </section>

      {/* BARRE DE RECHERCHE — collée sous le hero */}
      <div className="px-4 -mt-10 relative z-20 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-3 space-y-2">
          {/* Ligne 1 : champ texte */}
          <input
            type="text"
            placeholder="Coiffure, menuiserie, nom d'un atelier..."
            className="w-full h-12 px-4 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Ligne 2 : catégorie + géoloc + bouton */}
          <div className="flex gap-2">
            <select
              className="flex-1 h-11 pl-3 pr-8 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Tous les métiers</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <button
              type="button"
              onClick={handleGeolocateMe}
              title="Me géolocaliser"
              className="h-11 w-11 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>

            <button
              type="submit"
              className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors flex-shrink-0"
            >
              Chercher
            </button>
          </div>
        </form>
      </div>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-2xl lg:max-w-6xl w-full mx-auto px-4 py-10 flex-grow space-y-10">

        {/* CARTE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Ateliers à proximité
            </h2>
            {!isLoading && commerces.length > 0 && (
              <span className="text-xs text-slate-400">{commerces.length} résultat{commerces.length > 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-200 h-64 sm:h-96">
            <MapView
              key={mapKey}
              commerces={commerces}
              center={mapCenter}
              onMarkerClick={(artisan) => navigate(`/commerce/${artisan.id}`)}
            />
          </div>
        </div>

        {/* LISTE */}
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : commerces.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700">
              {commerces.length} artisan{commerces.length > 1 ? 's' : ''} trouvé{commerces.length > 1 ? 's' : ''}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {commerces.map((artisan) => (
                <CommerceCard
                  key={artisan.id}
                  commerce={artisan}
                  onViewDetails={() => navigate(`/commerce/${artisan.id}`)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">Aucun résultat. Essayez un autre terme ou activez la géolocalisation.</p>
          </div>
        )}

        {/* COMMENT CA MARCHE */}
        <div className="border-t border-slate-200 pt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">Comment ça marche</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: "1", title: "Recherchez", desc: "Tapez un métier ou un nom. Activez la localisation pour voir ce qui est proche." },
              { n: "2", title: "Consultez la fiche", desc: "Photos, adresse, horaires et avis d'autres clients — tout en un coup d'œil." },
              { n: "3", title: "Contactez directement", desc: "Un clic pour ouvrir WhatsApp. Pas d'intermédiaire, pas de frais." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 mb-1">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer className="border-t border-slate-200 py-6 px-4 text-center">
        <p className="text-xs text-slate-400">ArtisanConnect — Mise en relation citoyens &amp; artisans locaux</p>
      </footer>
    </div>
  );
}
