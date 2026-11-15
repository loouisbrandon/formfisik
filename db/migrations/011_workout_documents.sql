CREATE TABLE professional_presentations (
 owner_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 professional_name text NOT NULL DEFAULT '', brand text NOT NULL DEFAULT '',
 registration text NOT NULL DEFAULT '', contact text NOT NULL DEFAULT '',
 logo bytea CHECK (octet_length(logo)<=262144),
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE workout_documents (
 id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 plan_id uuid NOT NULL, plan_version integer NOT NULL,
 filename text NOT NULL, content bytea NOT NULL CHECK(octet_length(content)<=8388608),
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT now()+interval '15 minutes',
 FOREIGN KEY(owner_id,plan_id,plan_version) REFERENCES workout_versions(owner_id,plan_id,version) ON DELETE CASCADE
);
CREATE INDEX workout_documents_expiry ON workout_documents(expires_at);
CREATE INDEX workout_documents_owner ON workout_documents(owner_id,created_at);
