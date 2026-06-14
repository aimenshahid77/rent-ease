-- RentEase onboarding tables migration
-- Run this in Supabase SQL Editor

DO $$ BEGIN
  CREATE TYPE property_type AS ENUM ('room', 'apartment', 'house', 'studio', 'hostel');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE onboarding_document_type AS ENUM (
    'cnic_front',
    'cnic_back',
    'character_certificate',
    'profile_photo',
    'property_reference_photo'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS tenant_onboarding (
  user_id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name             TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  occupation            TEXT NOT NULL,
  monthly_income        NUMERIC(12,2) NOT NULL CHECK (monthly_income >= 0),
  reason_for_using      TEXT NOT NULL,
  preferred_city        TEXT NOT NULL,
  preferred_property_types property_type[] NOT NULL DEFAULT '{}',
  budget_min            NUMERIC(12,2) NOT NULL CHECK (budget_min >= 0),
  budget_max            NUMERIC(12,2) NOT NULL CHECK (budget_max >= budget_min),
  household_size        INTEGER NOT NULL DEFAULT 1 CHECK (household_size >= 1),
  move_in_date          DATE,
  cnic_number           TEXT,
  verification_status   verification_status NOT NULL DEFAULT 'pending',
  completed             BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS landlord_onboarding (
  user_id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name                 TEXT NOT NULL,
  phone                     TEXT NOT NULL,
  occupation                TEXT NOT NULL,
  monthly_income            NUMERIC(12,2) NOT NULL CHECK (monthly_income >= 0),
  reason_for_using          TEXT NOT NULL,
  ownership_status          TEXT NOT NULL,
  listing_intent            TEXT NOT NULL,
  property_city             TEXT NOT NULL,
  expected_listings_count   INTEGER NOT NULL DEFAULT 1 CHECK (expected_listings_count >= 1),
  cnic_number               TEXT,
  verification_status       verification_status NOT NULL DEFAULT 'pending',
  completed                 BOOLEAN NOT NULL DEFAULT false,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboarding_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('tenant', 'landlord')),
  document_type   onboarding_document_type NOT NULL,
  storage_path    TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  mime_type       TEXT,
  review_status   verification_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, document_type)
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tenant_onboarding_updated_at ON tenant_onboarding;
CREATE TRIGGER tenant_onboarding_updated_at
  BEFORE UPDATE ON tenant_onboarding
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS landlord_onboarding_updated_at ON landlord_onboarding;
CREATE TRIGGER landlord_onboarding_updated_at
  BEFORE UPDATE ON landlord_onboarding
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE tenant_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_onboarding_select_own" ON tenant_onboarding;
CREATE POLICY "tenant_onboarding_select_own" ON tenant_onboarding
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "tenant_onboarding_insert_own" ON tenant_onboarding;
CREATE POLICY "tenant_onboarding_insert_own" ON tenant_onboarding
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "tenant_onboarding_update_own" ON tenant_onboarding;
CREATE POLICY "tenant_onboarding_update_own" ON tenant_onboarding
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "landlord_onboarding_select_own" ON landlord_onboarding;
CREATE POLICY "landlord_onboarding_select_own" ON landlord_onboarding
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "landlord_onboarding_insert_own" ON landlord_onboarding;
CREATE POLICY "landlord_onboarding_insert_own" ON landlord_onboarding
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "landlord_onboarding_update_own" ON landlord_onboarding;
CREATE POLICY "landlord_onboarding_update_own" ON landlord_onboarding
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "onboarding_docs_select_own" ON onboarding_documents;
CREATE POLICY "onboarding_docs_select_own" ON onboarding_documents
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "onboarding_docs_insert_own" ON onboarding_documents;
CREATE POLICY "onboarding_docs_insert_own" ON onboarding_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_read_tenant_onboarding" ON tenant_onboarding;
CREATE POLICY "admin_read_tenant_onboarding" ON tenant_onboarding
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "admin_read_landlord_onboarding" ON landlord_onboarding;
CREATE POLICY "admin_read_landlord_onboarding" ON landlord_onboarding
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "admin_read_onboarding_docs" ON onboarding_documents;
CREATE POLICY "admin_read_onboarding_docs" ON onboarding_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('onboarding-documents', 'onboarding-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "onboarding_docs_upload_own" ON storage.objects;
CREATE POLICY "onboarding_docs_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'onboarding-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
DROP POLICY IF EXISTS "onboarding_docs_read_own" ON storage.objects;
CREATE POLICY "onboarding_docs_read_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'onboarding-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
DROP POLICY IF EXISTS "admin_read_onboarding_storage" ON storage.objects;
CREATE POLICY "admin_read_onboarding_storage" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'onboarding-documents'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
