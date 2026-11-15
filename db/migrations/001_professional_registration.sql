CREATE TABLE users (
  id uuid PRIMARY KEY,
  email varchar(254) NOT NULL UNIQUE CHECK (email = lower(email)),
  full_name varchar(120) NOT NULL,
  role text NOT NULL DEFAULT 'professional' CHECK (role IN ('professional', 'student', 'admin')),
  email_verified_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE credentials (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password_hash text NOT NULL CHECK (password_hash LIKE '$argon2id$%'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Pending attempts are isolated: confirming a link selects that attempt's credentials.
-- This prevents an earlier unverified registrant from choosing the eventual owner's password.
CREATE TABLE pending_registrations (
  token_hash char(64) PRIMARY KEY,
  email varchar(254) NOT NULL,
  full_name varchar(120) NOT NULL,
  password_hash text NOT NULL CHECK (password_hash LIKE '$argon2id$%'),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  CHECK (expires_at > created_at)
);
CREATE INDEX pending_registration_email_idx ON pending_registrations(email);
CREATE INDEX pending_registration_expiry_idx ON pending_registrations(expires_at);
CREATE TABLE abuse_limits (
  key char(64) PRIMARY KEY,
  attempts integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX abuse_limits_expiry_idx ON abuse_limits(expires_at);
