ALTER TABLE student_links ADD CONSTRAINT student_links_owner_id_017 UNIQUE(professional_id,id);
CREATE TABLE intake_forms (
 id uuid PRIMARY KEY, professional_id uuid NOT NULL REFERENCES users(id),
 draft jsonb NOT NULL, revision integer NOT NULL DEFAULT 1 CHECK(revision>0),
 archived boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(professional_id,id)
);
CREATE TABLE intake_versions (
 id uuid PRIMARY KEY, professional_id uuid NOT NULL, form_id uuid NOT NULL,
 number integer NOT NULL CHECK(number>0), definition jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(professional_id,id), UNIQUE(form_id,number),
 FOREIGN KEY(professional_id,form_id) REFERENCES intake_forms(professional_id,id) ON DELETE CASCADE
);
CREATE FUNCTION intake_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'immutable intake snapshot'; END $$;
CREATE TRIGGER intake_version_immutable BEFORE UPDATE ON intake_versions FOR EACH ROW EXECUTE FUNCTION intake_immutable();
CREATE TABLE intake_requests (
 id uuid PRIMARY KEY, professional_id uuid NOT NULL REFERENCES users(id), version_id uuid NOT NULL,
 student_link_id uuid, purpose text NOT NULL CHECK(purpose IN ('new','existing')),
 token_digest text NOT NULL UNIQUE CHECK(length(token_digest)=64),
 expires_at timestamptz NOT NULL, revoked_at timestamptz, submitted_at timestamptz,
 state text NOT NULL DEFAULT 'waiting' CHECK(state IN ('waiting','received','pending','reviewing','reviewed')),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(professional_id,id),
 FOREIGN KEY(professional_id,version_id) REFERENCES intake_versions(professional_id,id),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),
 CHECK(purpose<>'existing' OR student_link_id IS NOT NULL)
);
CREATE TABLE intake_submissions (
 request_id uuid PRIMARY KEY REFERENCES intake_requests(id) ON DELETE CASCADE,
 registration jsonb, answers jsonb NOT NULL, acknowledged_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER intake_submission_immutable BEFORE UPDATE ON intake_submissions FOR EACH ROW EXECUTE FUNCTION intake_immutable();
CREATE TABLE intake_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 professional_id uuid NOT NULL, request_id uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN ('created','revoked','received','pending','resolved','reviewing','reviewed','viewed')),
 occurred_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(professional_id,request_id) REFERENCES intake_requests(professional_id,id) ON DELETE CASCADE
);
CREATE INDEX intake_forms_owner ON intake_forms(professional_id,created_at DESC,id);
CREATE INDEX intake_requests_owner ON intake_requests(professional_id,created_at DESC,id);
CREATE INDEX intake_requests_student ON intake_requests(professional_id,student_link_id,created_at DESC);
