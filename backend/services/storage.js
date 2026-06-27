// backend/services/storage.js
import { createClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// Supabase client – service role key (privileged, for server‑side storage ops)
// -----------------------------------------------------------------------------
const supabaseUrl   = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Les variables d\'environnement SUPABASE_URL et SUPABASE_SERVICE_KEY doivent être définies.'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Téléverse une image (ou tout fichier) dans le bucket Supabase « photos ».
 *
 * @param {Buffer} buffer      - Contenu binaire du fichier.
 * @param {string} filename    - Nom original du fichier (ex: « photo.jpg »).
 * @param {string} mimetype    - Type MIME du fichier (ex: « image/jpeg »).
 * @returns {Promise<string>}  - URL publique du fichier uploadé.
 *
 * Le fichier est stocké sous le chemin :
 *   commerc<timestamp>_<filename>
 * où <timestamp> est le nombre de millisecondes depuis l’époque (Date.now()).
 *
 * En cas d’erreur, la promesse est rejetée avec l’erreur Supabase.
 */
export async function uploadPhoto(buffer, filename, mimetype) {
  // Normalisation du nom de fichier (on enlève les éventuels chemins)
  const safeName = filename.replace(/^.*[\\/]/, '');

  // Construction du chemin de stockage : commerc<timestamp>_<filename>
  const path = `commerces/${Date.now()}_${safeName}`;

  try {
    // Téléversement du fichier (buffer) dans le bucket « photos »
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('photos')
      .upload(path, buffer, {
        contentType: mimetype,
        upsert: false, // on ne veut pas écraser un fichier existant avec le même nom
      });

    if (uploadError) throw uploadError;

    // Récupération de l’URL publique du fichier uploadé
    const {
      data: { publicUrl },
      error: urlError,
    } = supabase.storage.from('photos').getPublicUrl(path);

    if (urlError) throw urlError;

    return publicUrl; // chaîne contenant l’URL directe du fichier
  } catch (err) {
    // On propage l’erreur afin que le contrôleur puisse la gérer
    console.error('Erreur lors de l upload de la photo :', err);
    throw err;
  }
}
