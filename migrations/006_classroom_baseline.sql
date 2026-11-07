CREATE TABLE classroom_baseline_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL,
  access_code_hash TEXT NOT NULL UNIQUE,
  current_window TEXT NOT NULL DEFAULT 'start_of_year' CHECK (current_window IN ('start_of_year','end_of_year')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE classroom_baseline_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classroom_baseline_classes(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  join_code_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE classroom_baseline_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES classroom_baseline_students(id) ON DELETE CASCADE,
  assessment_window TEXT NOT NULL CHECK (assessment_window IN ('start_of_year','end_of_year')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','completed')),
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  scores JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, assessment_window)
);
CREATE INDEX idx_classroom_baseline_students_class ON classroom_baseline_students(class_id);
CREATE INDEX idx_classroom_baseline_attempts_student ON classroom_baseline_attempts(student_id);