// backend/services/notation.js
import { Groq } from 'groq-sdk';

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  throw new Error(
    'La variable d\'environnement GROQ_API_KEY doit être définie pour utiliser le service de notation.'
  );
}

const groq = new Groq({ apiKey: groqApiKey });

export async function noterCommentaire(texte) {
  const prompt = `Tu es un assistant qui analyse des avis clients.

Donne une note de satisfaction de 1 à 5 étoiles pour cet avis client :
- 5 étoiles : très satisfait, excellent, impeccable, parfait
- 4 étoiles : bien, satisfait, bon service
- 3 étoiles : moyen, correct, ni bien ni mal
- 2 étoiles : décevant, problèmes, pas satisfait
- 1 étoile  : très mauvais, horrible, à éviter

Avis client : "${texte.trim()}"

Réponds UNIQUEMENT avec un chiffre entre 1 et 5, rien d'autre.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10,
      temperature: 0,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '';
    let note = parseInt(raw, 10);

    if (Number.isNaN(note)) note = 3;
    if (note < 1) note = 1;
    if (note > 5) note = 5;

    return note;
  } catch (err) {
    console.warn('Erreur lors de l appel à Groq pour la notation :', err);
    return 3;
  }
}
