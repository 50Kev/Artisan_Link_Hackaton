// backend/routes/commerces.js
import { Router } from 'express';
import multer from 'multer';
import verifyToken from '../middleware/verifyToken.js';
import { createClient } from '@supabase/supabase-js';
import { noterCommentaire } from '../services/notation.js';

const supabaseUrl       = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be defined');
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

const ok  = (res, data = null) => res.json({ success: true, data });
const err = (res, status, message) => res.status(status).json({ success: false, error: message });

// GET / – search / filter commerces
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('commerces').select('*');

    const { q, categorie } = req.query;
    if (q) {
      const search = `%${q}%`;
      query = query.or(`nom.ilike.${search},categorie.ilike.${search}`);
    }
    // filtre categorie exact depuis le select du frontend
    if (categorie) {
      query = query.ilike('categorie', `%${categorie}%`);
    }

    const { lat, lng, radius } = req.query;
    if (lat && lng && radius) {
      const latF = parseFloat(lat);
      const lngF = parseFloat(lng);
      const radiusKm = parseFloat(radius);
      const degLat = radiusKm / 111;
      const degLng = radiusKm / (111 * Math.cos((latF * Math.PI) / 180));
      query = query
        .gte('lat', latF - degLat).lte('lat', latF + degLat)
        .gte('lng', lngF - degLng).lte('lng', lngF + degLng);
    }

    const { data, error } = await query;
    if (error) throw error;
    return ok(res, data);
  } catch (e) {
    return err(res, 500, e.message);
  }
});

// GET /:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('commerces').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return err(res, 404, 'Commerce not found');
    return ok(res, data);
  } catch (e) {
    return err(res, 500, e.message);
  }
});

// POST / – create (protected)
// FIX: ajout de .select().single() requis par Supabase v2 pour obtenir la ligne insérée
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, categorie, description, telephone, adresse, horaires, lat, lng, visible = false, photos = [] } = req.body;

    const required = ['nom', 'categorie'];
    for (const field of required) {
      if (!req.body[field]) return err(res, 400, `${field} is required`);
    }

    const { data, error } = await supabase
      .from('commerces')
      .insert([{ user_id: userId, nom, categorie, description, telephone, adresse, horaires, lat, lng, visible, photos, note_moyenne: 0 }])
      .select()   // ← obligatoire en Supabase v2 pour récupérer la ligne créée
      .single();

    if (error) throw error;
    return ok(res, data);
  } catch (e) {
    return err(res, 500, e.message);
  }
});

// PUT /:id – update (owner only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { nom, categorie, description, telephone, adresse, horaires, lat, lng, visible, photos } = req.body;

    const { data: commerce, error: fetchErr } = await supabase
      .from('commerces').select('user_id').eq('id', id).single();
    if (fetchErr) throw fetchErr;
    if (!commerce) return err(res, 404, 'Commerce not found');
    if (commerce.user_id !== userId) return err(res, 403, 'Not authorized to update this commerce');

    const { data, error } = await supabase
      .from('commerces')
      .update({ nom, categorie, description, telephone, adresse, horaires, lat, lng, visible, photos, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return ok(res, data);
  } catch (e) {
    return err(res, 500, e.message);
  }
});

// PATCH /:id/publish
router.patch('/:id/publish', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { data: commerce, error: fetchErr } = await supabase
      .from('commerces').select('user_id').eq('id', id).single();
    if (fetchErr) throw fetchErr;
    if (!commerce) return err(res, 404, 'Commerce not found');
    if (commerce.user_id !== userId) return err(res, 403, 'Not authorized');

    const { data, error } = await supabase
      .from('commerces')
      .update({ visible: true, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    return ok(res, data);
  } catch (e) {
    return err(res, 500, e.message);
  }
});

// PATCH /:id/unpublish
router.patch('/:id/unpublish', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { data: commerce, error: fetchErr } = await supabase
      .from('commerces').select('user_id').eq('id', id).single();
    if (fetchErr) throw fetchErr;
    if (!commerce) return err(res, 404, 'Commerce not found');
    if (commerce.user_id !== userId) return err(res, 403, 'Not authorized');

    const { data, error } = await supabase
      .from('commerces')
      .update({ visible: false, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    return ok(res, data);
  } catch (e) {
    return err(res, 500, e.message);
  }
});

// POST /:id/photos – upload photo
router.post('/:id/photos', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: commerce, error: fetchErr } = await supabase
      .from('commerces').select('user_id, photos').eq('id', id).single();
    if (fetchErr) throw fetchErr;
    if (!commerce) return err(res, 404, 'Commerce not found');
    if (commerce.user_id !== userId) return err(res, 403, 'Not authorized');
    if (!req.file) return err(res, 400, 'No file uploaded');

    const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
    const { error: uploadErr } = await supabase.storage
      .from('photos').upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
    const photoUrl = urlData.publicUrl;

    const newPhotos = [...(commerce.photos || []), photoUrl];
    const { data: updated, error: updateErr } = await supabase
      .from('commerces')
      .update({ photos: newPhotos, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (updateErr) throw updateErr;

    return ok(res, { photoUrl, commerce: updated });
  } catch (e) {
    return err(res, 500, e.message);
  }
});

// GET /:id/commentaires
router.get('/:id/commentaires', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('commentaires').select('*').eq('commerce_id', id).order('created_at', { ascending: false });
    if (error) throw error;
    return ok(res, data);
  } catch (e) {
    return err(res, 500, e.message);
  }
});

// POST /:id/commentaires – add comment + AI rating
router.post('/:id/commentaires', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { texte } = req.body;

    if (!texte || texte.trim() === '') return err(res, 400, 'Comment text is required');

    const note = await noterCommentaire(texte);
    if (Number.isNaN(note) || note < 1 || note > 5) return err(res, 500, 'Invalid note returned from IA service');

    const { data: comment, error: commentErr } = await supabase
      .from('commentaires')
      .insert([{ commerce_id: id, user_id: userId, texte: texte.trim(), note }])
      .select()
      .single();
    if (commentErr) throw commentErr;

    const { data: notes, error: notesErr } = await supabase
      .from('commentaires').select('note').eq('commerce_id', id);
    if (notesErr) throw notesErr;

    const avg = notes.reduce((sum, c) => sum + Number(c.note), 0) / notes.length || 0;

    const { data: updatedCommerce, error: updErr } = await supabase
      .from('commerces')
      .update({ note_moyenne: Number(avg.toFixed(2)), updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (updErr) throw updErr;

    return ok(res, { comment, commerce: updatedCommerce });
  } catch (e) {
    return err(res, 500, e.message);
  }
});

export default router;
