import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import CommerceCard from '../components/CommerceCard';
import Spinner from '../components/Spinner';
import { getCommerces } from '../api/commerces';

// Ces valeurs correspondent exactement aux catégories insérées en DB (seed.js)
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
  const [mapKey, setMapKey] = useState(0); // force re-render carte à chaque recherche

  const fetchArtisans = async (filters = {}) => {
    try {
      setIsLoading(true);
      const data = await getCommerces(filters);
      setCommerces(data || []);
      setMapKey(k => k + 1); // force la carte à re-render avec les nouveaux marqueurs
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
    // Si une catégorie est sélectionnée dans le select ET qu'il y a du texte libre,
    // on envoie les deux : le backend cherchera le texte libre dans nom/description
    // et filtrera en plus sur la catégorie exacte.
    // Si seulement le texte est renseigné, le backend fait la normalisation des variantes
    // (ex: "Coiffure" → trouve "Coiffeur" grâce aux synonymes côté backend).
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (selectedCategory) params.categorie = selectedCategory;
    fetchArtisans(params);
  };

  const handleGeolocateMe = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        setMapCenter([coords.latitude, coords.longitude]);
        fetchArtisans({ lat: coords.latitude, lng: coords.longitude, radius: 50 });
      }, () => setIsLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      <Navbar />

      {/* HERO */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-20 pb-32 px-4 text-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-[10%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-sm">
            🤝 SongTaaba-market • Solidarité &amp; Valorisation Locale
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
            Soutenons nos artisans,<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              développons notre économie.
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Trouvez instantanément les artisans et professionnels qualifiés à proximité. Contactez-les directement sur WhatsApp sans aucun intermédiaire.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-slate-400 font-medium">
            <span>🛡️ Artisans de Confiance</span>
            <span>💬 Contact WhatsApp Direct</span>
            <span>🚀 Entraide &amp; Circuit Court</span>
          </div>
        </div>
      </section>

      {/* BARRE DE RECHERCHE */}
      <div className="max-w-5xl w-full mx-auto px-4 -mt-14 relative z-30">
        <form onSubmit={handleSearchSubmit} className="bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">Service recherché</label>
            <input type="text" placeholder="Ex: Coiffure, mécanique, ou nom d'un commerce..."
              className="w-full h-11 px-4 bg-slate-50 text-slate-800 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">Métier / Spécialité</label>
            <select className="w-full h-11 pl-4 pr-10 bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer font-medium appearance-none"
              value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Toutes les catégories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="md:col-span-1 pt-5">
            <button type="button" onClick={handleGeolocateMe} title="Me géolocaliser"
              className="w-full h-11 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-all cursor-pointer flex items-center justify-center border border-slate-200/80"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
          </div>
          <div className="md:col-span-2 pt-5">
            <button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md">
              Trouver
            </button>
          </div>
        </form>
      </div>

      {/* CONTENU */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 flex-grow space-y-16">

        {/* CARTE — directement navigable, pas d'overlay */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                Cartographie des Ateliers Partenaires
              </h2>
              <p className="text-xs text-slate-500">Naviguez librement et cliquez sur un marqueur pour voir la fiche de l'artisan.</p>
            </div>
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
              SongTaaba Network
            </span>
          </div>

          {/* Carte sans overlay, hauteur fixe */}
          <div className="bg-white p-2 rounded-3xl shadow-md border border-slate-200/50 overflow-hidden h-[450px] sm:h-[550px]">
            <div className="w-full h-full rounded-2xl overflow-hidden">
              <MapView
                key={mapKey}
                commerces={commerces}
                center={mapCenter}
                onMarkerClick={(artisan) => navigate(`/commerce/${artisan.id}`)}
              />
            </div>
          </div>
        </div>

        {/* LISTE ARTISANS */}
        <div className="space-y-6">
          <div className="border-b border-slate-200/60 pb-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {commerces.length > 0 ? `${commerces.length} artisan(s) disponible(s)` : "Artisans recommandés"}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : commerces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {commerces.map((artisan) => (
                <CommerceCard key={artisan.id} commerce={artisan}
                  onViewDetails={() => navigate(`/commerce/${artisan.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 text-center shadow-lg max-w-2xl mx-auto">
              <h3 className="text-lg sm:text-xl font-bold mb-2">Bienvenue sur SongTaaba-market</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                Activez la localisation ou utilisez notre moteur de recherche pour découvrir les artisans locaux.
              </p>
            </div>
          )}
        </div>

        {/* GUIDE */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/60 shadow-sm space-y-8">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Pourquoi choisir SongTaaba-market ?</h2>
            <p className="text-xs text-slate-500 mt-1">Le numérique comme levier de solidarité pour le commerce de proximité.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { n: "01", color: "blue", title: "Localisation Directe", desc: "Repérez immédiatement les ateliers actifs dans votre zone géographique." },
              { n: "02", color: "emerald", title: "Zéro Intermédiaire", desc: "Échangez en direct par WhatsApp. Prix transparents, sans frais cachés." },
              { n: "03", color: "amber", title: "Économie Solidaire", desc: "Chaque interaction valorise un artisan indépendant et renforce le tissu local." },
            ].map(({ n, color, title, desc }) => (
              <div key={n} className="space-y-2.5 text-center sm:text-left">
                <div className={`w-10 h-10 bg-${color}-50 text-${color}-600 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm mx-auto sm:mx-0`}>{n}</div>
                <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}