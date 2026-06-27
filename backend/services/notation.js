// backend/services/notation.js
import { Groq } from 'groq-sdk';

// -----------------------------------------------------------------------------
// Initialisation du client Groq (clé lue depuis les variables d'environnement)
// -----------------------------------------------------------------------------
const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  throw new Error(
    'La variable d\'environnement GROQ_API_KEY doit être définie pour utiliser le service de notation.'
  );
}
const groq = new Groq({ apiKey: groqApiKey });

/**
 * Évalue un commentaire en renvoyant une note entière comprise entre 1 et 5.
 *
 * @param {string} texte - Le commentaire à noter (en français ou toute autre langue).
 * @returns {Promise<number>} Une note entre 1 et 5.
 *
 * Le prompt demande au modèle de retourner **uniquement** un entier.
 * En cas d'erreur ou de réponse non numérique, on revient à 3 (note neutre)
 * et on s'assure que la valeur finale soit bien comprise entre 1 et 5.
 */
export async function noterCommentaire(texte) {
  // Nettoyage basique du texte envoyé au modèle
  const prompt = `Donne une note de 1 à 5 (un seul entier) pour évaluer la qualité du commentaire suivant :\n\n"${texte.trim()}"\n\nRéponds uniquement avec le chiffre.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10,          // assez pour un seul chiffre + éventuels espaces
      temperature: 0,          // déterministe → toujours le même résultat pour le même texte
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '';
    let note = parseInt(raw, 10);

    // Si la réponse n'est pas un nombre, on tombe sur la note neutre 3
    if (Number.isNaN(note)) {
      note = 3;
    }

    // Clamp entre 1 et 5 au cas où le modèle retournerait quelque chose d'inattendu
    if (note < 1) note = 1;
    if (note > 5) note = 5;

    return note;
  } catch (err) {
    // En cas de problème avec l'API Groq, on renvoie la note neutre
    console.warn('Erreur lors de l appel à Groq pour la notation :', err);
    return 3;
  }
}

