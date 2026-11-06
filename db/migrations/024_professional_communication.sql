-- Operational records only. No external delivery or student authentication.
CREATE TABLE communication_templates (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL REFERENCES users(id),title varchar(120) NOT NULL,
 body varchar(4000) NOT NULL,version integer NOT NULL DEFAULT 1 CHECK(version>0),archived boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),UNIQUE(professional_id,id)
);
CREATE INDEX communication_templates_owner ON communication_templates(professional_id,archived,lower(title),id);
CREATE TABLE communication_template_versions (
 professional_id uuid NOT NULL,template_id uuid NOT NULL,version integer NOT NULL,body varchar(4000) NOT NULL,title varchar(120) NOT NULL,
 actor_id uuid NOT NULL REFERENCES users(id),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),PRIMARY KEY(professional_id,template_id,version),
 FOREIGN KEY(professional_id,template_id) REFERENCES communication_templates(professional_id,id),CHECK(actor_id=professional_id)
);
CREATE TRIGGER communication_template_version_immutable BEFORE UPDATE ON communication_template_versions FOR EACH ROW EXECUTE FUNCTION intake_immutable();
CREATE TABLE communication_records (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL REFERENCES users(id),student_link_id uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN('prepared','external_declared')),channel text NOT NULL CHECK(channel IN('email','whatsapp','phone','in_person','other')),
 body varchar(4000) NOT NULL,occurred_at timestamptz NOT NULL,actor_id uuid NOT NULL REFERENCES users(id),
 template_id uuid,template_version integer,context jsonb,corrects_id uuid UNIQUE,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(professional_id,id),UNIQUE(professional_id,id,student_link_id),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),
 FOREIGN KEY(professional_id,template_id,template_version) REFERENCES communication_template_versions(professional_id,template_id,version),
 FOREIGN KEY(professional_id,corrects_id,student_link_id) REFERENCES communication_records(professional_id,id,student_link_id),
 CHECK((template_id IS NULL)=(template_version IS NULL)),CHECK(actor_id=professional_id)
);
CREATE INDEX communication_records_student ON communication_records(professional_id,student_link_id,occurred_at DESC,id);
CREATE TRIGGER communication_record_immutable BEFORE UPDATE ON communication_records FOR EACH ROW EXECUTE FUNCTION intake_immutable();
CREATE TABLE communication_reads (
 professional_id uuid NOT NULL REFERENCES users(id),source_key varchar(180) NOT NULL,student_link_id uuid NOT NULL,
 read_at timestamptz NOT NULL DEFAULT clock_timestamp(),PRIMARY KEY(professional_id,source_key),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id)
);
CREATE TABLE communication_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,professional_id uuid NOT NULL REFERENCES users(id),student_link_id uuid,
 subject_id uuid,kind text NOT NULL,actor_id uuid NOT NULL REFERENCES users(id),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),CHECK(actor_id=professional_id)
);
CREATE INDEX communication_events_owner ON communication_events(professional_id,id DESC);
CREATE TABLE communication_operations (
 professional_id uuid NOT NULL REFERENCES users(id),operation_key uuid NOT NULL,digest char(64) NOT NULL,student_link_id uuid,
 result jsonb NOT NULL,invalidated_at timestamptz,PRIMARY KEY(professional_id,operation_key)
);
