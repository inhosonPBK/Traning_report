-- ── Profiles ────────────────────────────────────────────────────
-- Drop and recreate with updated role/status constraints
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT CHECK (role IN ('intern', 'mentor', 'manager')),
  department  TEXT,
  mentor_id   UUID REFERENCES profiles(id),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reports ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
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

DROP TRIGGER IF EXISTS reports_updated_at ON reports;
CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ───────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports  ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating
DROP POLICY IF EXISTS "own profile" ON profiles;
DROP POLICY IF EXISTS "mentor sees intern profile" ON profiles;
DROP POLICY IF EXISTS "intern owns reports" ON reports;
DROP POLICY IF EXISTS "mentor accesses intern reports" ON reports;
DROP POLICY IF EXISTS "manager reads all profiles" ON profiles;
DROP POLICY IF EXISTS "manager reads all reports" ON reports;

-- Profiles: own row
CREATE POLICY "own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id);

-- Profiles: mentor can see their paired interns
CREATE POLICY "mentor sees intern profile"
  ON profiles FOR SELECT
  USING (id IN (SELECT id FROM profiles WHERE mentor_id = auth.uid()));

-- Profiles: manager can see all approved profiles
CREATE POLICY "manager reads all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager' AND status = 'approved')
  );

-- Reports: intern owns their own reports
CREATE POLICY "intern owns reports"
  ON reports FOR ALL
  USING (intern_id = auth.uid());

-- Reports: mentor accesses paired intern's reports
CREATE POLICY "mentor accesses intern reports"
  ON reports FOR ALL
  USING (
    intern_id IN (SELECT id FROM profiles WHERE mentor_id = auth.uid())
  );

-- Reports: manager can read all reports
CREATE POLICY "manager reads all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager' AND status = 'approved')
  );

-- ── Notes ────────────────────────────────────────────────────────
-- Admin approval operations (approve user, set role, pair intern-mentor)
-- are performed via server actions using the SERVICE ROLE KEY, which
-- bypasses RLS. Never expose the service role key to the client.
--
-- Bootstrap first manager: after creating your auth user, run:
--   UPDATE profiles SET status = 'approved', role = 'manager' WHERE email = 'inho.son@promega.com';
-- (or do this from the Supabase dashboard table editor)
