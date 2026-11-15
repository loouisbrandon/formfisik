-- Extend the existing document pipeline; old workout rows and constraints remain valid.
ALTER TABLE workout_documents ALTER COLUMN plan_id DROP NOT NULL;
ALTER TABLE workout_documents ALTER COLUMN plan_version DROP NOT NULL;
ALTER TABLE workout_documents ADD COLUMN kind text NOT NULL DEFAULT 'workout' CHECK(kind IN ('workout','physical_report'));
ALTER TABLE workout_documents ADD COLUMN student_link_id uuid;
ALTER TABLE workout_documents ADD COLUMN manifest jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(octet_length(manifest::text)<=2097152);
ALTER TABLE workout_documents ADD CONSTRAINT document_owner_id UNIQUE(owner_id,id);
ALTER TABLE workout_documents ADD CONSTRAINT document_student FOREIGN KEY(owner_id,student_link_id) REFERENCES student_links(professional_id,id);
ALTER TABLE workout_documents ADD CONSTRAINT document_kind_binding CHECK((kind='workout' AND plan_id IS NOT NULL AND plan_version IS NOT NULL AND student_link_id IS NULL) OR (kind='physical_report' AND plan_id IS NULL AND plan_version IS NULL AND student_link_id IS NOT NULL));
CREATE TABLE document_photo_authorizations (
 document_id uuid PRIMARY KEY,owner_id uuid NOT NULL,context_digest text NOT NULL,
 purpose text NOT NULL CHECK(purpose='shareable_physical_report'),
 source varchar(500) NOT NULL,obtained_on date NOT NULL,subject text NOT NULL CHECK(subject IN ('adult','guardian')),
 guardian_reference varchar(200) NOT NULL DEFAULT '',attested_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(owner_id,document_id) REFERENCES workout_documents(owner_id,id) ON DELETE CASCADE
);
CREATE TABLE document_photo_references (
 document_id uuid NOT NULL,owner_id uuid NOT NULL,student_link_id uuid NOT NULL,record_id uuid NOT NULL,image_id uuid NOT NULL,record_version integer NOT NULL,
 PRIMARY KEY(document_id,image_id),FOREIGN KEY(owner_id,document_id) REFERENCES workout_documents(owner_id,id) ON DELETE CASCADE,
 FOREIGN KEY(owner_id,student_link_id,record_id) REFERENCES photo_records(professional_id,student_link_id,id),
 FOREIGN KEY(owner_id,image_id) REFERENCES progress_photo_images(professional_id,id)
);
CREATE INDEX document_photo_image ON document_photo_references(image_id);
-- Revoke temporary copies too, not only access to their original objects.
CREATE FUNCTION revoke_photo_documents() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF TG_TABLE_NAME='progress_photo_images' THEN
  IF NEW.state<>'ready' THEN DELETE FROM workout_documents d USING document_photo_references r WHERE d.id=r.document_id AND r.image_id=NEW.id; END IF;
 ELSE
  IF NEW.revoked_at IS NOT NULL THEN DELETE FROM workout_documents d USING document_photo_references r,photo_records p WHERE d.id=r.document_id AND p.id=r.record_id AND p.authorization_id=NEW.id; END IF;
 END IF;RETURN NEW;END $$;
CREATE TRIGGER revoke_image_documents AFTER UPDATE OF state ON progress_photo_images FOR EACH ROW EXECUTE FUNCTION revoke_photo_documents();
CREATE TRIGGER revoke_authorization_documents AFTER UPDATE OF revoked_at ON photo_authorizations FOR EACH ROW EXECUTE FUNCTION revoke_photo_documents();
