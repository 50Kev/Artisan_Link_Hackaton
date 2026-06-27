-- ------------------------------------------------------------
--  Initialisation de la base Supabase – ArtisanConnect
--  Tables : commerces, commentaires
--  RLS activé + policies + index de performance
-- ------------------------------------------------------------

-- 1️⃣ Activation de l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2️⃣ Table commerces
CREATE TABLE commerces (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES auth.users(id),
    nom             TEXT NOT NULL,
    categorie       TEXT NOT NULL,
    description     TEXT,
    telephone       TEXT,
    adresse         TEXT,
    horaires        TEXT,
    lat             FLOAT,
    lng             FLOAT,
    visible         BOOLEAN DEFAULT false,
    photos          TEXT[],                     -- tableau d'URLs de photos
    note_moyenne    FLOAT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 3️⃣ Table commentaires
CREATE TABLE commentaires (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commerce_id     UUID REFERENCES commerces(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES auth.users(id),
    texte           TEXT NOT NULL,
    note            INT    CHECK (note BETWEEN 1 AND 5),
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 4️⃣ Activation du Row Level Security (RLS)
ALTER TABLE commerces ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentaires ENABLE ROW LEVEL SECURITY;

-- 5️⃣ Policies RLS

-- ----- commerces -----
-- Lecture publique : uniquement les commerces visibles
CREATE POLICY "commerces_select_public" ON commerces
    FOR SELECT
    USING (visible = true);

-- Écriture (INSERT/UPDATE/DELETE) réservée au propriétaire du commerce
CREATE POLICY "commerces_insert_owner" ON commerces
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "commerces_update_owner" ON commerces
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "commerces_delete_owner" ON commerces
    FOR DELETE
    USING (auth.uid() = user_id);

-- ----- commentaires -----
-- Lecture publique pour tous
CREATE POLICY "commentaires_select_public" ON commentaires
    FOR SELECT
    USING (true);

-- Écriture réservée au propriétaire du commentaire
CREATE POLICY "commentaires_insert_owner" ON commentaires
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "commentaires_update_owner" ON commentaires
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "commentaires_delete_owner" ON commentaires
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6️⃣ Index de performance
CREATE INDEX idx_commerces_categorie      ON commerces(categorie);
CREATE INDEX idx_commerces_lat_lng        ON commerces(lat, lng);
CREATE INDEX idx_commentaires_commerce_id ON commentaires(commerce_id);
