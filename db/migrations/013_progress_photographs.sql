-- Body photographs are private objects. PostgreSQL contains metadata, never image bytes.
CREATE TABLE photo_authorizations (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL REFERENCES users(id),student_link_id uuid NOT NULL,
 source varchar(500) NOT NULL,obtained_on date,subject text CHECK(subject IN ('adult','guardian')),
 guardian_reference varchar(200) NOT NULL DEFAULT '',attested_by uuid NOT NULL REFERENCES users(id),
 attested_at timestamptz NOT NULL DEFAULT now(),revoked_at timestamptz,
 UNIQUE(professional_id,student_link_id,id),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),
 CHECK(attested_by=professional_id)
);
CREATE TABLE photo_records (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL REFERENCES users(id),student_link_id uuid NOT NULL,authorization_id uuid NOT NULL,
 photo_date date CHECK(photo_date>='1900-01-01'),notes varchar(1000) NOT NULL DEFAULT '',
 state text NOT NULL DEFAULT 'active' CHECK(state IN ('active','archived','deleting','deleted')),
 version integer NOT NULL DEFAULT 1 CHECK(version>0),author_id uuid NOT NULL REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 creation_key uuid NOT NULL,creation_digest text,
 UNIQUE(professional_id,creation_key),UNIQUE(professional_id,id),UNIQUE(professional_id,student_link_id,id),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),
 FOREIGN KEY(professional_id,student_link_id,authorization_id) REFERENCES photo_authorizations(professional_id,student_link_id,id),
 CHECK(author_id=professional_id),CHECK(state IN ('deleting','deleted') OR photo_date IS NOT NULL)
);
CREATE INDEX photo_records_calendar ON photo_records(professional_id,student_link_id,state,photo_date,id);
CREATE TABLE progress_photo_images (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL,student_link_id uuid NOT NULL,record_id uuid NOT NULL,
 position text CHECK(position IN ('front','back','right','left','other')),description varchar(120) NOT NULL DEFAULT '',
 object_key text NOT NULL UNIQUE,upload_key uuid NOT NULL,digest text,
 state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','ready','deleting','deleted')),
 byte_count integer NOT NULL CHECK(byte_count BETWEEN 0 AND 3145728),width integer,height integer,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 cleanup_due_at timestamptz,cleanup_attempts integer NOT NULL DEFAULT 0,
 UNIQUE(professional_id,upload_key),UNIQUE(professional_id,id),
 FOREIGN KEY(professional_id,student_link_id,record_id) REFERENCES photo_records(professional_id,student_link_id,id),
 CHECK(state IN ('deleting','deleted') OR (position IS NOT NULL AND width>0 AND height>0))
);
CREATE INDEX progress_photo_images_record ON progress_photo_images(professional_id,record_id,state,created_at,id);
CREATE INDEX progress_photo_cleanup ON progress_photo_images(cleanup_due_at) WHERE cleanup_due_at IS NOT NULL;
CREATE TABLE photo_record_events (
 professional_id uuid NOT NULL,record_id uuid NOT NULL,version integer NOT NULL,
 kind text NOT NULL CHECK(kind IN ('created','edited','archived','reactivated','uploaded','replaced','image_removal_requested','record_removal_requested','image_deleted','record_deleted','upload_failed')),
 actor_id uuid NOT NULL REFERENCES users(id),occurred_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(record_id,version),FOREIGN KEY(professional_id,record_id) REFERENCES photo_records(professional_id,id),CHECK(actor_id=professional_id)
);
CREATE TABLE photo_removal_operations (
 professional_id uuid NOT NULL REFERENCES users(id),operation_key uuid NOT NULL,record_id uuid NOT NULL,digest text NOT NULL,
 reason text NOT NULL CHECK(reason IN ('student_request','authorization_revoked','correction')),created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(professional_id,operation_key),FOREIGN KEY(professional_id,record_id) REFERENCES photo_records(professional_id,id)
);
