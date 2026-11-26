-- Mobile families use an inaccessible Web-session anchor so existing revocation
-- writers (reset, settings, security and closure) remain authoritative.
ALTER TABLE sessions ADD COLUMN logical_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE sessions ADD CONSTRAINT session_logical_identity UNIQUE(logical_id);
CREATE TABLE mobile_session_families (
 id uuid PRIMARY KEY REFERENCES sessions(logical_id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES users(id),
 installation_id uuid NOT NULL, label varchar(80) NOT NULL,
 platform text NOT NULL CHECK(platform IN('android','ios')),
 last_relevant_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 generation integer NOT NULL DEFAULT 1 CHECK(generation>0)
);
CREATE INDEX mobile_session_user ON mobile_session_families(user_id);
CREATE TABLE mobile_session_tokens (
 digest char(64) PRIMARY KEY, family_id uuid NOT NULL REFERENCES mobile_session_families(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN('access','refresh')), generation integer NOT NULL,
 expires_at timestamptz, consumed_at timestamptz,
 CHECK((kind='access' AND expires_at IS NOT NULL) OR kind='refresh')
);
CREATE INDEX mobile_token_family ON mobile_session_tokens(family_id);
CREATE TABLE mobile_refresh_receipts (
 family_id uuid NOT NULL REFERENCES mobile_session_families(id) ON DELETE CASCADE,
 operation_id uuid NOT NULL, old_digest char(64) NOT NULL, proof_digest char(64) NOT NULL,
 generation integer NOT NULL, ciphertext text, key_id varchar(80) NOT NULL,
 expires_at timestamptz NOT NULL, PRIMARY KEY(family_id,operation_id)
);
CREATE TABLE session_login_challenges (
 digest char(64) PRIMARY KEY,user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 credential_digest char(64) NOT NULL, kind text NOT NULL CHECK(kind IN('web','mobile')),
 device jsonb, expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '5 minutes',
 consumed_at timestamptz
);
