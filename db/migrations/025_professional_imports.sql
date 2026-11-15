-- Marco026: bounded temporary normalized inputs; canonical destinations remain unchanged.
CREATE TABLE professional_imports (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL REFERENCES users(id),creation_key uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN('students','exercises','templates')),request_digest char(64) NOT NULL,
 state text NOT NULL DEFAULT 'preview' CHECK(state IN('preview','processing','completed','canceled','expired')),
 version integer NOT NULL DEFAULT 1 CHECK(version>0),total integer NOT NULL CHECK(total BETWEEN 1 AND 500),approval_digest char(64),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '24 hours',
 UNIQUE(professional_id,id),UNIQUE(professional_id,creation_key)
);
CREATE INDEX professional_imports_history ON professional_imports(professional_id,created_at DESC,id);
CREATE INDEX professional_imports_expiry ON professional_imports(expires_at,id) WHERE state IN('preview','processing');
CREATE TABLE professional_import_rows (
 professional_id uuid NOT NULL,job_id uuid NOT NULL,line integer NOT NULL CHECK(line BETWEEN 1 AND 500),creation_key uuid NOT NULL,
 state text NOT NULL CHECK(state IN('valid','invalid','duplicate','conflict','imported','ignored','rejected','erased')),
 decision text NOT NULL CHECK(decision IN('create','skip','distinct')),input jsonb,error_code text,file_matches integer[] NOT NULL DEFAULT '{}',
 result_id uuid,student_link_id uuid,
 PRIMARY KEY(professional_id,job_id,line),UNIQUE(professional_id,creation_key),
 FOREIGN KEY(professional_id,job_id) REFERENCES professional_imports(professional_id,id),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),
 CHECK(input IS NULL OR state IN('valid','duplicate','conflict')),
 CHECK((state='imported')=(result_id IS NOT NULL)),CHECK(student_link_id IS NULL OR student_link_id=result_id)
);
CREATE TABLE professional_import_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,professional_id uuid NOT NULL,job_id uuid NOT NULL,actor_id uuid NOT NULL REFERENCES users(id),
 kind text NOT NULL CHECK(kind IN('preview','confirmed','batch','completed','canceled','expired','report_downloaded')),processed integer NOT NULL DEFAULT 0 CHECK(processed BETWEEN 0 AND 500),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(professional_id,job_id) REFERENCES professional_imports(professional_id,id),CHECK(actor_id=professional_id)
);
CREATE INDEX professional_import_events_job ON professional_import_events(professional_id,job_id,id DESC);
CREATE FUNCTION import_input_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF (to_jsonb(NEW)-'state'-'decision'-'input'-'error_code'-'result_id'-'student_link_id') IS DISTINCT FROM (to_jsonb(OLD)-'state'-'decision'-'input'-'error_code'-'result_id'-'student_link_id') OR (NEW.input IS DISTINCT FROM OLD.input AND NEW.input IS NOT NULL) THEN RAISE EXCEPTION 'IMMUTABLE_IMPORT_INPUT'; END IF;
 IF OLD.state IN('imported','ignored','rejected','erased') AND NEW.state NOT IN(OLD.state,'erased') THEN RAISE EXCEPTION 'TERMINAL_IMPORT_ROW'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER import_input_immutable BEFORE UPDATE ON professional_import_rows FOR EACH ROW EXECUTE FUNCTION import_input_immutable();
CREATE INDEX student_records_import_email ON student_records(professional_id,lower(email)) WHERE email IS NOT NULL AND email<>'';
CREATE INDEX student_records_import_phone ON student_records(professional_id,phone) WHERE phone IS NOT NULL AND phone<>'';
