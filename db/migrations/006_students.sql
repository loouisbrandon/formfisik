-- Private registrations are never shared or matched by email across professionals.
CREATE TABLE student_records (
 id uuid PRIMARY KEY,
 professional_id uuid NOT NULL REFERENCES users(id),
 full_name varchar(120) NOT NULL CHECK(length(trim(full_name))>=2),
 email varchar(254), phone varchar(20), birth_date date,
 admin_notes varchar(1000) NOT NULL DEFAULT '',
 UNIQUE(professional_id,id)
);
CREATE TABLE student_links (
 id uuid PRIMARY KEY,
 professional_id uuid NOT NULL REFERENCES users(id),
 student_id uuid NOT NULL,
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','archived')),
 version integer NOT NULL DEFAULT 1 CHECK(version>0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 archived_at timestamptz, reactivated_at timestamptz,
 creation_key uuid NOT NULL, creation_digest text NOT NULL,
 UNIQUE(professional_id,student_id), UNIQUE(professional_id,creation_key),
 FOREIGN KEY(professional_id,student_id) REFERENCES student_records(professional_id,id),
 CHECK((status='active' AND archived_at IS NULL) OR (status='archived' AND archived_at IS NOT NULL))
);
CREATE INDEX student_links_portfolio ON student_links(professional_id,status,created_at DESC,id);
CREATE INDEX student_records_name ON student_records(professional_id,lower(full_name),id);
