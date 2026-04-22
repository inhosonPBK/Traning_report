-- ── Profiles ────────────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL CHECK (role IN ('intern', 'mentor')),
  department  TEXT NOT NULL,
  mentor_id   UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reports ──────────────────────────────────────────────────────
CREATE TABLE reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id        UUID NOT NULL REFERENCES profiles(id),
  week_number      INTEGER NOT NULL,
  topic            TEXT,
  learned          TEXT,
  rating           TEXT CHECK (rating IN ('Excellent','Good','Okay','Tough','')),
  feeling          TEXT,
  questions        TEXT,
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','submitted','completed')),
  submitted_at     TIMESTAMPTZ,
  mentor_good      TEXT,
  mentor_next      TEXT,
  mentor_qa        TEXT,
  mentor_progress  TEXT CHECK (mentor_progress IN ('On Track','Minor Adjustment','Review Required','')),
  mentor_id        UUID REFERENCES profiles(id),
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(intern_id, week_number)
);

-- ── Auto-update updated_at ───────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ───────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports  ENABLE ROW LEVEL SECURITY;

-- profiles: own row + mentors can see their interns
CREATE POLICY "own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "mentor sees intern profile"
  ON profiles FOR SELECT
  USING (id IN (SELECT id FROM profiles WHERE mentor_id = auth.uid()));

-- reports: intern owns theirs; mentor accesses their paired intern's reports
CREATE POLICY "intern owns reports"
  ON reports FOR ALL
  USING (intern_id = auth.uid());

CREATE POLICY "mentor accesses intern reports"
  ON reports FOR ALL
  USING (
    intern_id IN (SELECT id FROM profiles WHERE mentor_id = auth.uid())
  );

-- ── Seed: profiles (fill UUIDs after creating auth users) ────────
-- Run this after creating the 4 auth users via Supabase dashboard.
-- Replace the UUID values with actual auth.users IDs.
--
-- INSERT INTO profiles (id, name, email, role, department, mentor_id) VALUES
--   ('<hongmin-uuid>',  'Hongmin Lee',  'hongmin.lee@promega.com',  'intern',  'Procurement',            '<jiwon-uuid>'),
--   ('<jiwon-uuid>',   'Jiwon Hwang',  'jiwon.hwang@promega.com',  'mentor',  'Procurement',            NULL),
--   ('<soomin-uuid>',  'Soomin Kim',   'soomin.kim@promega.com',   'intern',  'Manufacturing Engineer',  '<inho-uuid>'),
--   ('<inho-uuid>',    'Inho Son',     'inho.son@promega.com',     'mentor',  'Manufacturing Engineer',  NULL);
