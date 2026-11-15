CREATE TABLE ecoach_conversations (
 id uuid PRIMARY KEY,owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title varchar(100) NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 100),version integer NOT NULL DEFAULT 1 CHECK(version>0),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(owner_id,id)
);
CREATE INDEX ecoach_conversations_owner_updated ON ecoach_conversations(owner_id,updated_at DESC,id);
CREATE TABLE ecoach_turns (
 conversation_id uuid NOT NULL,owner_id uuid NOT NULL,operation_id uuid NOT NULL,
 position integer NOT NULL CHECK(position BETWEEN 1 AND 20),
 user_text varchar(2000) NOT NULL CHECK(length(trim(user_text))>0),assistant_text varchar(4000) NOT NULL,
 context jsonb CHECK(context IS NULL OR jsonb_typeof(context)='object'),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(conversation_id,position),UNIQUE(owner_id,operation_id),
 FOREIGN KEY(owner_id,conversation_id) REFERENCES ecoach_conversations(owner_id,id) ON DELETE CASCADE
);
