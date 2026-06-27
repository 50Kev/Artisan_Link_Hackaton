# SongTaaba-Market

> Connecter les citoyens avec les artisans locaux.

---

## Présentation

SongTaaba-Market est une plateforme web de mise en relation entre citoyens et artisans locaux, développée dans le cadre d'un hackathon. L'application permet de trouver rapidement un professionnel de proximité — menuisier, coiffeur, mécanicien, plombier — et de le contacter directement par WhatsApp, sans intermédiaire.

Les artisans peuvent créer et gérer leur fiche en ligne en quelques minutes : photos, description, horaires, coordonnées GPS. Les avis laissés par les clients sont analysés automatiquement par intelligence artificielle pour générer une note.

---

## Architecture

Le projet est organisé en monorepo avec deux applications indépendantes :

```
SongTaaba-Market/
├── frontend/          # Application React — déployée sur Vercel
├── backend/           # API REST Express — déployée sur Render
└── supabase/
    └── migrations/    # Schéma PostgreSQL initial
```

**Flux de données :**

```
Utilisateur → React (Vercel) → API Express (Render) → Supabase (PostgreSQL + Storage)
                                        ↓
                                  Groq API (LLaMA 3)
                                  Notation IA des avis
```

---

## Technologies

### Frontend
| Outil | Rôle |
|---|---|
| React 18 + Vite | Interface utilisateur (SPA) |
| React Router v6 | Navigation entre les pages |
| Tailwind CSS | Styles utilitaires |
| Leaflet / React-Leaflet | Carte interactive OpenStreetMap |
| Axios | Appels HTTP vers l'API |

### Backend
| Outil | Rôle |
|---|---|
| Node.js + Express | API REST |
| Supabase JS SDK | Client base de données |
| Multer | Upload de fichiers (photos) |
| Groq SDK (LLaMA 3 70B) | Analyse de sentiment et notation IA |
| dotenv | Gestion des variables d'environnement |

### Infrastructure
| Service | Usage |
|---|---|
| Supabase | Base de données PostgreSQL, Auth, Storage |
| Vercel | Hébergement frontend (CI/CD GitHub) |
| Render | Hébergement backend (Web Service Node) |

---

## Installation

### Prérequis

- Node.js 18+
- Un projet Supabase (gratuit sur [supabase.com](https://supabase.com))
- Une clé API Groq (gratuite sur [console.groq.com](https://console.groq.com))

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/SongTaaba-Market.git
cd SongTaaba-Market
```

### 2. Configurer le backend

```bash
cd backend
cp .env.exemple .env
```

Remplir `.env` :

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
GROQ_API_KEY=gsk_...
PORT=3001
```

```bash
npm install
```

### 3. Configurer le frontend

```bash
cd ../frontend
```

Créer un fichier `.env.local` :

```env
VITE_API_URL=http://localhost:3001/api
```

```bash
npm install
```

### 4. Initialiser la base de données

Exécuter le fichier `supabase/migrations/init.sql` dans l'éditeur SQL de votre projet Supabase.

### 5. Alimenter les données de test (optionnel)

```bash
cd backend
node seed.js
```

### 6. Lancer en développement

**Windows** — double-cliquer sur `start.bat` à la racine.

**Ou manuellement :**

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

L'application est accessible sur [http://localhost:5173](http://localhost:5173).

---

## Déploiement

Le projet utilise un déploiement continu via GitHub — chaque `git push` sur `main` déclenche automatiquement un nouveau build sur Vercel et Render.

### Frontend — Vercel

1. Importer le repo GitHub sur [vercel.com](https://vercel.com)
2. Définir le **Root Directory** : `frontend`
3. **Build Command** : `npm run build`
4. **Output Directory** : `dist`
5. Ajouter la variable d'environnement :
   ```
   VITE_API_URL=https://votre-backend.onrender.com/api
   ```

### Backend — Render

1. Créer un **Web Service** sur [render.com](https://render.com)
2. Connecter le repo GitHub
3. Définir le **Root Directory** : `backend`
4. **Build Command** : `npm install`
5. **Start Command** : `node server.js`
6. Ajouter les variables d'environnement :
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_KEY=...
   GROQ_API_KEY=...
   ```

> Le frontend et le backend peuvent être déployés depuis le même repo GitHub sans avoir à le séparer.

---

## Équipe

Projet développé par **SongTaaba Network** dans le cadre du Hackathon 2025.
