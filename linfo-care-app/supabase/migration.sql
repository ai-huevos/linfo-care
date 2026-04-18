-- LinfoCare v2 Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/uzizsrlpxrzkvcjjclro/sql

-- Profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT NOT NULL DEFAULT 'Familia',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authenticated" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  nickname TEXT,
  birth_date DATE,
  hospital TEXT,
  unit TEXT,
  admission_date DATE,
  primary_diagnosis TEXT,
  stage TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients viewable by authenticated" ON patients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert patients" ON patients FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update patients" ON patients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Treatment Phases
CREATE TABLE treatment_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('active', 'completed', 'upcoming')),
  start_date DATE,
  end_date DATE,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  doc_type TEXT DEFAULT 'other' CHECK (doc_type IN ('biopsy','lab_report','imaging','discharge','consent','research','other')),
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab Results
CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  entered_by UUID REFERENCES profiles(id),
  lab_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  normal_min NUMERIC,
  normal_max NUMERIC,
  result_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical Questions
CREATE TABLE medical_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  answered_by UUID REFERENCES profiles(id),
  answered_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  entry_type TEXT DEFAULT 'note' CHECK (entry_type IN ('note','observation','doctor_update','mood')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  logged_by UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  dose TEXT,
  route TEXT,
  frequency TEXT,
  notes TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care Shifts
CREATE TABLE care_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES profiles(id),
  shift_date DATE NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('morning','afternoon','night')),
  task_notes TEXT,
  volunteer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, shift_date, slot)
);

-- Daily Checklist
CREATE TABLE daily_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES profiles(id),
  item_id TEXT NOT NULL,
  check_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, item_id, check_date)
);

-- Inventory
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('have','buying','missing','pending')),
  assigned_to TEXT,
  notes TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id),
  actor_name TEXT DEFAULT 'Familia',
  action TEXT NOT NULL,
  detail TEXT,
  entity_type TEXT,
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  messages JSONB DEFAULT '[]',
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables with simple authenticated policies
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'treatment_phases','documents','lab_results','medical_questions',
    'journal_entries','medications','care_shifts','daily_checklist',
    'inventory_items','activity_log','ai_conversations'
  ]) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "auth_read_%1$s" ON %1$I FOR SELECT USING (auth.role() = ''authenticated'')', t);
    EXECUTE format('CREATE POLICY "auth_insert_%1$s" ON %1$I FOR INSERT WITH CHECK (auth.role() = ''authenticated'')', t);
    EXECUTE format('CREATE POLICY "auth_update_%1$s" ON %1$I FOR UPDATE USING (auth.role() = ''authenticated'')', t);
    EXECUTE format('CREATE POLICY "auth_delete_%1$s" ON %1$I FOR DELETE USING (auth.role() = ''authenticated'')', t);
  END LOOP;
END $$;

-- Seed: Roro patient record
INSERT INTO patients (full_name, nickname, birth_date, hospital, unit, admission_date, primary_diagnosis, stage, metadata)
VALUES (
  'Rodrigo Cardona Moreno',
  'Roro',
  '1948-01-01',
  'Clínica del Country',
  'UCI → Oncología',
  '2026-04-06',
  'Linfoma B difuso de células grandes (DLBCL)',
  'IV (pendiente confirmación A/B)',
  '{"ipi_score": "pending", "pet_ct_date": "2026-04-07", "suv_max": 26.7, "ldh_peak": 2100, "age": 78}'::jsonb
);

-- Seed: Treatment phases
INSERT INTO treatment_phases (patient_id, name, status, start_date, description, sort_order) VALUES
((SELECT id FROM patients LIMIT 1), 'Ingreso y estabilización UCI', 'completed', '2026-04-06', 'Manejo del tubo de tórax, nutrición, dolor, control de infección.', 1),
((SELECT id FROM patients LIMIT 1), 'Diagnóstico y estudios', 'completed', '2026-04-07', 'PET-CT, biopsias, laboratorios completos, TAC cráneo.', 2),
((SELECT id FROM patients LIMIT 1), 'Traslado a oncología', 'active', '2026-04-14', 'Entorno más tranquilo. Equipo multidisciplinar.', 3),
((SELECT id FROM patients LIMIT 1), 'Pre-fase de prednisona', 'upcoming', NULL, '5-7 días solo con esteroide + protección de riñón. Labs frecuentes.', 4),
((SELECT id FROM patients LIMIT 1), 'Ciclo 1 R-CHOP / R-mini-CHOP', 'upcoming', NULL, 'Primer ciclo de quimioterapia. Monitoreo estrecho.', 5),
((SELECT id FROM patients LIMIT 1), 'Nadir (valle de defensas)', 'upcoming', NULL, 'Día 7-14 post-quimio. Riesgo máximo de infección.', 6),
((SELECT id FROM patients LIMIT 1), 'Recuperación ciclo 1', 'upcoming', NULL, 'Los glóbulos suben, tolera más comida.', 7),
((SELECT id FROM patients LIMIT 1), 'Ciclo 2 R-CHOP', 'upcoming', NULL, 'Se repite cada 21 días si todo OK.', 8),
((SELECT id FROM patients LIMIT 1), 'PET intermedio', 'upcoming', NULL, 'Después del ciclo 2 o 4. Evalúa respuesta al tratamiento.', 9),
((SELECT id FROM patients LIMIT 1), 'Completar 6 ciclos', 'upcoming', NULL, 'PET final para evaluar remisión.', 10);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can view documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');
