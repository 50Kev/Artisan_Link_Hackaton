// backend/services/interpret.js
// Mapping local de mots-clés → catégorie DB (zéro API, zéro token)

const normalize = (str) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Dictionnaire : mot-clé normalisé → catégorie exacte en DB
const KEYWORD_MAP = {
  // Mécanique
  'mecanique':    'Mécanique', 'mecanicien': 'Mécanique', 'voiture': 'Mécanique',
  'auto':         'Mécanique', 'automobile': 'Mécanique', 'moto':    'Mécanique',
  'moteur':       'Mécanique', 'garage':     'Mécanique', 'pneu':    'Mécanique',
  'reparation':   'Mécanique', 'reparer':    'Mécanique', 'vidange': 'Mécanique',

  // Menuiserie
  'menuiserie':   'Menuiserie', 'menuisier': 'Menuiserie', 'bois':   'Menuiserie',
  'meuble':       'Menuiserie', 'porte':     'Menuiserie', 'fenetre':'Menuiserie',
  'charpente':    'Menuiserie', 'parquet':   'Menuiserie',

  // Électricité
  'electricite':  'Électricité', 'electricien': 'Électricité', 'courant': 'Électricité',
  'cablage':      'Électricité', 'panneau':     'Électricité', 'solaire': 'Électricité',
  'branchement':  'Électricité', 'prise':       'Électricité', 'lumiere': 'Électricité',

  // Plomberie
  'plomberie':    'Plomberie', 'plombier': 'Plomberie', 'eau':    'Plomberie',
  'robinet':      'Plomberie', 'tuyau':    'Plomberie', 'fuite':  'Plomberie',
  'fosse':        'Plomberie', 'wc':       'Plomberie', 'toilette':'Plomberie',

  // Maçonnerie
  'maconnerie':   'Maçonnerie', 'macon':    'Maçonnerie', 'construction': 'Maçonnerie',
  'batiment':     'Maçonnerie', 'ciment':   'Maçonnerie', 'brique':       'Maçonnerie',
  'btp':          'Maçonnerie', 'maison':   'Maçonnerie', 'mur':          'Maçonnerie',

  // Coiffure
  'coiffure':     'Coiffure', 'coiffeur':  'Coiffure', 'coiffeuse': 'Coiffure',
  'cheveux':      'Coiffure', 'salon':     'Coiffure', 'tresse':    'Coiffure',
  'barber':       'Coiffure', 'barbier':   'Coiffure', 'rasage':    'Coiffure',

  // Couture
  'couture':      'Couture', 'couturier': 'Couture', 'couturiere': 'Couture',
  'vetement':     'Couture', 'tissu':     'Couture', 'retouche':   'Couture',
  'tailleur':     'Couture', 'confection':'Couture', 'broderie':   'Couture',

  // Restauration
  'restauration': 'Restauration', 'restaurant': 'Restauration', 'manger':  'Restauration',
  'nourriture':   'Restauration', 'cuisine':    'Restauration', 'traiteur':'Restauration',
  'repas':        'Restauration', 'food':       'Restauration', 'snack':   'Restauration',
};

/**
 * Analyse le texte de recherche et retourne le terme optimisé + catégorie si trouvée.
 * Aucun appel réseau — mapping local uniquement.
 *
 * @param {string} userQuery
 * @param {string[]} dbCategories - Catégories réelles en DB (pour validation)
 * @returns {{ term: string, categorie: string|null, suggestion: string }}
 */
export function interpretQuery(userQuery, dbCategories = []) {
  const words   = normalize(userQuery).split(/\s+/);
  let   matched = null;

  // Chercher le premier mot qui matche dans le dictionnaire
  for (const word of words) {
    if (KEYWORD_MAP[word]) {
      const candidate = KEYWORD_MAP[word];
      // Vérifier que la catégorie existe bien en DB (si liste dispo)
      if (dbCategories.length === 0 || dbCategories.includes(candidate)) {
        matched = candidate;
        break;
      }
    }
  }

  if (matched) {
    return {
      term:       matched,
      categorie:  matched,
      suggestion: `Artisans en ${matched}`,
    };
  }

  // Aucun match → retourne la requête originale telle quelle
  return {
    term:       userQuery,
    categorie:  null,
    suggestion: null,
  };
}