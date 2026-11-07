ALTER TABLE classroom_baseline_classes DROP CONSTRAINT IF EXISTS classroom_baseline_classes_current_window_check;
ALTER TABLE classroom_baseline_classes ADD CONSTRAINT classroom_baseline_classes_current_window_check CHECK (current_window IN ('start_of_year','mid_year','end_of_year'));
ALTER TABLE classroom_baseline_attempts DROP CONSTRAINT IF EXISTS classroom_baseline_attempts_assessment_window_check;
ALTER TABLE classroom_baseline_attempts ADD CONSTRAINT classroom_baseline_attempts_assessment_window_check CHECK (assessment_window IN ('start_of_year','mid_year','end_of_year'));
CREATE TABLE classroom_baseline_observations (
  student_id UUID NOT NULL REFERENCES classroom_baseline_students(id) ON DELETE CASCADE,
  assessment_window TEXT NOT NULL CHECK (assessment_window IN ('start_of_year','mid_year','end_of_year')),
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  note TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, assessment_window)
);
CREATE INDEX idx_classroom_baseline_observations_student ON classroom_baseline_observations(student_id);