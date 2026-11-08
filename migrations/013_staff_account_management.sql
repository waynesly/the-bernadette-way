ALTER TABLE staff_journal_accounts ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE staff_journal_accounts ADD COLUMN IF NOT EXISTS disabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE staff_journal_accounts ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS staff_journal_admin_audit (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), actor_id UUID REFERENCES staff_journal_accounts(id), action TEXT NOT NULL, target_username TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());