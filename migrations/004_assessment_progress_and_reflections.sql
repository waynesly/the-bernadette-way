ALTER TABLE submissions
  ADD COLUMN assessment_version TEXT;

CREATE TABLE assessment_progress (
  resume_token_hash TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_question INTEGER NOT NULL DEFAULT 0 CHECK (current_question BETWEEN 0 AND 95),
  assessment_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessment_progress_updated_at ON assessment_progress(updated_at);

CREATE TABLE student_reflections (
  id BIGSERIAL PRIMARY KEY,
  resume_token_hash TEXT NOT NULL,
  strength_id TEXT NOT NULL,
  how_used TEXT NOT NULL,
  what_happened TEXT NOT NULL,
  impact_on_others TEXT NOT NULL,
  learned TEXT NOT NULL,
  future_goal TEXT NOT NULL,
  selected_for_report BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT student_reflections_strength_id_length CHECK (char_length(strength_id) BETWEEN 1 AND 80)
);

CREATE INDEX idx_student_reflections_token_created_at ON student_reflections(resume_token_hash, created_at DESC);