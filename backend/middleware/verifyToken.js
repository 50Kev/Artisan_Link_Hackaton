// backend/middleware/verifyToken.js
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// Supabase client (anon key – sufficient for token verification)
// -----------------------------------------------------------------------------
const supabaseUrl   = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Les variables d\'environnement SUPABASE_URL et SUPABASE_ANON_KEY doivent être définies.'
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Middleware d'authentification Supabase (Bearer JWT)
 * - Attend un header : Authorization: Bearer <jwt>
 * - Vérifie le token avec supabase.auth.getUser()
 * - En cas de succès : req.user = { id, email, ... } provenant de Supabase
 * - En cas d'échec : renvoie 401 avec { success: false, error: 'Token invalide' }
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token invalide',
    });
  }

  const token = authHeader.split(' ')[1]; // extraire le JWT

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw error || new Error('Utilisateur non trouvé');
    }

    // on attache l'utilisateur (au minimum son id et son email) à la requête
    req.user = {
      id: user.id,
      email: user.email,
      // vous pouvez ajouter d'autres champs si besoin (ex: user.app_metadata, user.user_metadata)
    };

    return next();
  } catch (err) {
    console.error('Erreur de vérification du token :', err);
    return res.status(401).json({
      success: false,
      error: 'Token invalide',
    });
  }
};

export default verifyToken;
