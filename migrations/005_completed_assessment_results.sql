ALTER TABLE assessment_progress
  ADD COLUMN completed_at TIMESTAMPTZ,
  ADD COLUMN completed_scores JSONB,
  ADD COLUMN completed_submission_id UUID;