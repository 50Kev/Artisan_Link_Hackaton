import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import CommerceCard from '../components/CommerceCard';
import Spinner from '../components/Spinner';
import { getCommerces } from '../api/commerces';

const CATEGORIES = [
  "Tous", "Menuisier", "Mécanicien", "Coiffeur", "Couturier",
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
  const [showMap, setShowMap] = useState(false);

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
    if (selectedCategory && selectedCategory !== 'Tous') params.categorie = selectedCategory;
    fetchArtisans(params);
  };

  const handleCategoryChip = (cat) => {
    const val = cat === 'Tous' ? '' : cat;
    setSelectedCategory(val);
    fetchArtisans(val ? { categorie: val } : {});
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* HERO compact */}
      <section className="bg-slate-900 text-white px-4 pt-8 pb-16">
        <div className="max-w-lg mx-auto text-center space-y-2">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-400">
            Ouagadougou & environs
          </p>
          <h1 className="text-2xl font-bold leading-tight text-white">
            Trouvez l'artisan{' '}
            <span className="text-blue-400">qu'il vous faut.</span>
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed">
            Contactez directement les pros de votre quartier via WhatsApp.
          </p>
        </div>
      </section>

      {/* BARRE DE RECHERCHE flottante */}
      <div className="px-3 -mt-8 relative z-20 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-3 space-y-2">
          {/* Champ texte + bouton géoloc */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Coiffeur, mécanicien..."
              className="flex-1 h-11 px-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
              className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors flex-shrink-0"
            >
              Chercher
            </button>
          </div>
        </form>
      </div>

      {/* CHIPS CATÉGORIES */}
      <div className="px-3 mt-4 max-w-2xl mx-auto w-full">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => {
            const active = cat === 'Tous' ? selectedCategory === '' : selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChip(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-2xl lg:max-w-6xl w-full mx-auto px-3 pt-4 pb-10 flex-grow space-y-4">

        {/* TOGGLE CARTE */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            {isLoading ? 'Recherche...' : ${commerces.length} artisan${commerces.length > 1 ? 's' : ''} trouvé${commerces.length > 1 ? 's' : ''}}
          </p>
          <button
            onClick={() => setShowMap(v => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
            {showMap ? 'Masquer carte' : 'Voir carte'}
          </button>
        </div>

        {/* CARTE — masquée par défaut sur mobile */}
        {showMap && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 h-52 sm:h-80">
            <MapView
              key={mapKey}
              commerces={commerces}
              center={mapCenter}
              onMarkerClick={(artisan) => navigate(/commerce/${artisan.id})}
            />
          </div>
        )}

        {/* LISTE */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : commerces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {commerces.map((artisan) => (
              <CommerceCard
                key={artisan.id}
                commerce={artisan}
                onViewDetails={() => navigate(/commerce/${artisan.id})}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <p className="text-3xl">🔍</p>
            <p className="text-sm">Aucun résultat.</p>
            <p className="text-xs">Essayez un autre terme ou activez la géolocalisation.</p>
          </div>
        )}

        {/* COMMENT CA MARCHE */}
        <div className="border-t border-slate-200 pt-6 mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Comment ça marche</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: "1", title: "Recherchez", desc: "Tapez un métier ou activez la localisation." },
              { n: "2", title: "Consultez", desc: "Photos, adresse, horaires et avis clients." },
              { n: "3", title: "Contactez", desc: "Un clic pour ouvrir WhatsApp. Sans intermédiaire." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-3 items-start bg-white rounded-xl p-3 border border-slate-100">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {n}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-4 px-4 text-center">
        <p className="text-xs text-slate-400">ArtisanConnect — Mise en relation citoyens &amp; artisans locaux</p>
      </footer>
    </div>
  );
}
