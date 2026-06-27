import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importation du Fournisseur de Contexte d'Authentification
import { AuthProvider } from './context/AuthContext';

// Importation du Composant de Protection de Route
import PrivateRoute from './components/PrivateRoute';

// Importation des Pages de l'Application
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewCommerce from './pages/NewCommerce';
import CommercePage from './pages/CommercePage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ─── ROUTES PUBLIQUES ─── */}
          {/* Page d'accueil : recherche textuelle, filtres et cartographie */}
          <Route path="/" element={<Home />} />
          
          {/* Formulaire de connexion (Mobile-first) */}
          <Route path="/login" element={<Login />} />
          
          {/* Formulaire d'inscription (Mobile-first) */}
          <Route path="/register" element={<Register />} />
          
          {/* Fiche de consultation publique détaillée d'un artisan et de ses avis IA */}
          <Route path="/commerce/:id" element={<CommercePage />} />

          {/* ─── ROUTES PRIVÉES (PROPRIÉTAIRES / ARTISANS) ─── */}
          {/* Tableau de bord de gestion des fiches et visibilité */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          {/* Formulaire de création de commerce avec géolocalisation et photos */}
          <Route 
            path="/commerces/new" 
            element={
              <PrivateRoute>
                <NewCommerce />
              </PrivateRoute>
            } 
          />

          {/* Route de repli / Redirection 404 (Optionnelle mais recommandée) */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}