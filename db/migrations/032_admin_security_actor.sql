-- Nullable for historical operator events; no guessed actor/backfill.
ALTER TABLE account_security_events ADD COLUMN actor_id uuid;
