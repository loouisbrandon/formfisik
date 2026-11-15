CREATE TABLE password_resets (
  token_hash char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '30 minutes',
  CHECK (expires_at > created_at)
);
CREATE INDEX password_resets_user_idx ON password_resets(user_id);
CREATE INDEX password_resets_expiry_idx ON password_resets(expires_at);
