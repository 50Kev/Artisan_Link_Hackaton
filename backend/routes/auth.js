// backend/routes/auth.js
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

// ---------- Initialisation du client Supabase ----------
const supabaseUrl   = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Les variables d\'environnement SUPABASE_URL et SUPABASE_ANON_KEY doivent être définies.'
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @body    { email: string, password: string }
 * @returns { success: true, data: { user } }  ||
 *          { success: false, error: string }
 */
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email et password sont requis.',
    });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Vous pouvez ajouter des métadonnées ici si besoin:
    // options: { data: { ... } }
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  // signUp renvoie toujours un utilisateur (même si email nécessite confirmation)
  return res.status(201).json({
    success: true,
    data: { user: data.user },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur et retour du JWT access_token
 * @body    { email: string, password: string }
 * @returns { success: true, data: { access_token, user } } ||
 *          { success: false, error: string }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email et password sont requis.',
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({
      success: false,
      error: 'Identifiants invalides.',
    });
  }

  const { access_token, user } = data.session; // session contient access_token + user

  return res.json({
    success: true,
    data: { access_token, user },
  });
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Envoi d'un lien de réinitialisation de mot de passe
 * @body    { email: string }
 * @returns { success: true, data: null } ||
 *          { success: false, error: string }
 */
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email requis.',
    });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Optionnel : rediriger l'utilisateur après le clic sur le lien
    // redirectTo: 'https://votresite.com/reset-password',
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  return res.json({
    success: true,
    data: null,
    message:
      'Si l\'email existe dans notre base, un lien de réinitialisation a été envoyé.',
  });
});

export default router;
