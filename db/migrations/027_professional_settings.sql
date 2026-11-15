-- Settings are separate from billing, professional document branding and student records.
CREATE TABLE professional_settings (
 user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 profile jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(profile)='object'),
 account jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(account)='object'),
 cpf_ciphertext text,
 cpf_last_digits varchar(2),
 preferences jsonb NOT NULL DEFAULT '{"agenda":true,"checkins":true,"contracts":true}'::jsonb,
 avatar bytea CHECK(octet_length(avatar)<=262144),
 version integer NOT NULL DEFAULT 1 CHECK(version>0),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE settings_privacy_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN ('access','correction','erasure')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','completed','denied')),
 created_at timestamptz NOT NULL DEFAULT now(),
 resolved_at timestamptz
);
CREATE UNIQUE INDEX settings_privacy_open ON settings_privacy_requests(user_id,kind) WHERE status IN ('pending','processing');
ALTER TABLE settings_privacy_requests ADD COLUMN resolution_reference varchar(120);
CREATE TABLE settings_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN ('profile_saved','account_saved','preferences_saved','avatar_saved','password_changed','sessions_revoked','privacy_status_changed','email_changed')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX settings_events_owner ON settings_events(user_id,created_at DESC);
ALTER TABLE professional_settings ADD COLUMN published_profile jsonb CHECK(published_profile IS NULL OR jsonb_typeof(published_profile)='object');
CREATE TABLE settings_email_changes (
 token_hash char(64) PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 email varchar(254) NOT NULL,
 credential_digest char(64) NOT NULL,
 expires_at timestamptz NOT NULL DEFAULT now()+interval '30 minutes',
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX settings_email_owner ON settings_email_changes(user_id);
