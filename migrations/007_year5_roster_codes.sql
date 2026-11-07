CREATE TABLE year5_rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL,
  access_code_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE year5_roster_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roster_id UUID NOT NULL REFERENCES year5_rosters(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  join_code_hash TEXT NOT NULL UNIQUE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE assessment_progress ADD COLUMN year5_roster_student_id UUID REFERENCES year5_roster_students(id) ON DELETE SET NULL;
ALTER TABLE submissions ADD COLUMN year5_roster_student_id UUID REFERENCES year5_roster_students(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX idx_year5_roster_student_submission ON submissions(year5_roster_student_id) WHERE year5_roster_student_id IS NOT NULL;
CREATE INDEX idx_year5_roster_students_roster ON year5_roster_students(roster_id);