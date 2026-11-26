-- Working copies never publish a prescription or append workout history.
CREATE TABLE workout_editor_drafts (
 owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 context varchar(80) NOT NULL,
 revision serial NOT NULL CHECK (revision > 0),
 base_version integer NOT NULL CHECK (base_version >= 0),
 document jsonb NOT NULL CHECK (octet_length(document::text) <= 524288),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(owner_id, context)
);
CREATE INDEX workout_editor_drafts_updated ON workout_editor_drafts(owner_id,updated_at DESC,context);
