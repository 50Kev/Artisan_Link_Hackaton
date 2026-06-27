import 'dotenv/config';  // ← doit être en TOUT PREMIER
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import commercesRoutes from './routes/commerces.js';
import errorHandler from './middleware/errorHandler.js';
// -----------------------------------------------------------------------------
// Chargement des variables d'environnement (.env)
// -----------------------------------------------------------------------------

const app = express();
const PORT = process.env.PORT || 3001;

// -----------------------------------------------------------------------------
// Middleware CORS
// Autorise :
//   • http://localhost:5173  (dev Vite)
//   • L'URL du frontend en prod définie dans .env (FRONTEND_URL)
// -frontend peut être undefined ; dans ce cas on ne l'ajoute pas à la liste.
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean); // supprime les valeurs vides/undefined

app.use(
  cors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (ex. Postman, serveur‑side) ou celles présentes dans la liste
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // si vous utilisez des cookies ou l'en-tête Authorization
  })
);

// -----------------------------------------------------------------------------
// Body parser
// -----------------------------------------------------------------------------
app.use(express.json());

// -----------------------------------------------------------------------------
// Routes API
// -----------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/commerces', commercesRoutes);

// -----------------------------------------------------------------------------
// Gestion globale des erreurs (doit être déclaré après toutes les routes)
// -----------------------------------------------------------------------------
app.use(errorHandler);

// -----------------------------------------------------------------------------
// Lancement du serveur
// -----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

export default app; // export utile pour les tests éventuels
