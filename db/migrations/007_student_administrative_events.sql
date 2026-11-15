-- Minimal administrative history: transitions/versions only, no personal-data snapshots.
ALTER TABLE student_links ADD CONSTRAINT student_link_owner_id UNIQUE(professional_id,id);
CREATE TABLE student_administrative_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 professional_id uuid NOT NULL,
 link_id uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN ('created','updated','archived','reactivated')),
 version integer NOT NULL CHECK(version>0),
 occurred_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(link_id,version),
 FOREIGN KEY(professional_id,link_id) REFERENCES student_links(professional_id,id)
);
-- Creation date is already factual; do not reconstruct edits or transitions without evidence.
INSERT INTO student_administrative_events(professional_id,link_id,kind,version,occurred_at)
SELECT professional_id,id,'created',1,created_at FROM student_links;
CREATE INDEX student_administrative_history ON student_administrative_events(professional_id,link_id,occurred_at DESC);
