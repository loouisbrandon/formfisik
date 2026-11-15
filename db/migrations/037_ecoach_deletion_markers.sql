-- No titles/text: prevent a delayed retry of the first turn recreating a deleted conversation.
CREATE TABLE ecoach_deleted_conversations (
 id uuid PRIMARY KEY,owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 deleted_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX ecoach_deleted_owner ON ecoach_deleted_conversations(owner_id);
