import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function generatePhone() {
  return `+226${Math.floor(10000000 + Math.random() * 90000000)}`;
}

function randomCoord(base) {
  return parseFloat((base + (Math.random() * 2 - 1) * 0.02).toFixed(6));
}

const commerces = [
  { nom: 'Garage Auto-Plus', categorie: 'Mécanicien', description: 'Réparation toutes marques.', adresse: 'Rue du Commerce, Ouagadougou', horaires: 'Lun-Sam 08h-18h' },
  { nom: 'Couture Féminine', categorie: 'Couturier', description: 'Confection sur mesure.', adresse: 'Avenue Kwame Nkrumah', horaires: 'Lun-Sam 09h-19h' },
  { nom: 'Salon Éclat', categorie: 'Coiffeur', description: 'Coupes modernes, tresses.', adresse: 'Rue du 15 Octobre', horaires: 'Lun-Dim 08h-20h' },
  { nom: 'Atelier Soudure Pro', categorie: 'Soudeur', description: 'Soudure MIG/TIG.', adresse: 'Zone Industrielle', horaires: 'Lun-Ven 07h-17h' },
  { nom: 'Menuiserie Bois Noble', categorie: 'Menuisier', description: 'Portes, fenêtres, meubles.', adresse: 'Rue des Artisans', horaires: 'Lun-Sam 08h-18h' },
  { nom: 'PhoneFix Ouaga', categorie: 'Réparateur téléphone', description: 'Réparation écrans, batteries.', adresse: 'Marché Ouagadougou Stand 12', horaires: 'Lun-Sam 09h-19h' },
  { nom: 'Boulangerie Dorée', categorie: 'Boulanger', description: 'Pain, viennoiseries fraîches.', adresse: "Avenue de l'Indépendance", horaires: 'Lun-Dim 05h-20h' },
  { nom: 'Studio Photo Lumière', categorie: 'Photographe', description: 'Portraits, événements.', adresse: 'Rue du 16 Novembre', horaires: 'Lun-Sam 10h-19h' },
];

async function runSeed() {
  console.log('Debut du seed...');
  for (const c of commerces) {
    const { error } = await supabase.from('commerces').insert([{
      user_id: null,
      nom: c.nom,
      categorie: c.categorie,
      description: c.description,
      telephone: generatePhone(),
      adresse: c.adresse,
      horaires: c.horaires,
      lat: randomCoord(12.37),
      lng: randomCoord(-1.53),
      visible: true,
      photos: [],
      note_moyenne: parseFloat((Math.random() * 1.5 + 3.5).toFixed(2)),
    }]);

    if (error) {
      console.error('Erreur:', c.nom, error.message);
    } else {
      console.log('Insere:', c.nom);
    }
  }
  console.log('Seed termine.');
}

runSeed();