-- Neutral personal identity is not a professional entitlement or a student link.
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK(role IN('professional','student','admin','personal'));
CREATE TABLE account_legal_documents (
 id uuid PRIMARY KEY, kind text NOT NULL CHECK(kind IN('terms','privacy')),
 version varchar(80) NOT NULL CHECK(length(trim(version))>0), sha256 char(64) NOT NULL CHECK(sha256 ~ '^[a-f0-9]{64}$'),
 title varchar(160) NOT NULL CHECK(length(trim(title))>0), content text NOT NULL CHECK(octet_length(content)<=12288),
 url varchar(2048), effective_at timestamptz NOT NULL,
 synthetic boolean NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(kind,version),CHECK((synthetic AND url IS NULL) OR (NOT synthetic AND url IS NOT NULL AND url LIKE 'https://%'))
);
CREATE TABLE account_legal_publications (
 environment text NOT NULL CHECK(environment IN('local','staging','production')),
 kind text NOT NULL CHECK(kind IN('terms','privacy')),
 document_id uuid NOT NULL REFERENCES account_legal_documents(id),
 published_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(environment,kind)
);
CREATE TABLE account_legal_acceptances (
 id uuid PRIMARY KEY,user_id uuid NOT NULL REFERENCES users(id),
 document_id uuid NOT NULL REFERENCES account_legal_documents(id),
 operation_id uuid NOT NULL,accepted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 presented_at timestamptz NOT NULL,source text NOT NULL CHECK(source='mobile'),
 service_issuer varchar(120) NOT NULL,request_id uuid NOT NULL,
 UNIQUE(user_id,document_id),CHECK(presented_at<=accepted_at)
);
ALTER TABLE pending_registrations ADD COLUMN purpose text NOT NULL DEFAULT 'professional' CHECK(purpose IN('professional','personal'));
ALTER TABLE pending_registrations ADD COLUMN legal_evidence jsonb;
-- Immutable versions and receipts; publication pointers alone can evolve.
CREATE FUNCTION immutable_account_legal_row() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'LEGAL_RECORD_IMMUTABLE'; END $$;
CREATE TRIGGER account_legal_document_immutable BEFORE UPDATE OR DELETE ON account_legal_documents FOR EACH ROW EXECUTE FUNCTION immutable_account_legal_row();
-- Runtime cannot delete receipts. Explicit approved erasure remains operator-only.
CREATE TRIGGER account_legal_acceptance_immutable BEFORE UPDATE ON account_legal_acceptances FOR EACH ROW EXECUTE FUNCTION immutable_account_legal_row();
