ALTER TABLE pending_registrations ADD COLUMN code_hash char(64);
ALTER TABLE pending_registrations ADD COLUMN code_attempts integer NOT NULL DEFAULT 0 CHECK(code_attempts BETWEEN 0 AND 5);
ALTER TABLE pending_registrations ADD COLUMN last_sent_at timestamptz NOT NULL DEFAULT clock_timestamp();
-- Existing high-entropy links remain valid only until their original expiry.
