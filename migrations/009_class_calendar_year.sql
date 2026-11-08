ALTER TABLE classroom_baseline_classes
  ADD COLUMN IF NOT EXISTS calendar_year INTEGER NOT NULL DEFAULT 2026;

CREATE INDEX IF NOT EXISTS idx_classroom_baseline_classes_year_name
  ON classroom_baseline_classes(calendar_year DESC, class_name);