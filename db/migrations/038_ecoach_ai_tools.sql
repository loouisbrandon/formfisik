CREATE TABLE ecoach_ai_requests (
 owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,operation_id uuid NOT NULL,conversation_id uuid NOT NULL,
 digest char(64) NOT NULL,state text NOT NULL CHECK(state IN('running','done','failed')),
 result jsonb,input_tokens integer NOT NULL DEFAULT 0,output_tokens integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '24 hours',
 PRIMARY KEY(owner_id,operation_id)
);
CREATE INDEX ecoach_ai_owner_date ON ecoach_ai_requests(owner_id,created_at);
CREATE INDEX ecoach_ai_conversation ON ecoach_ai_requests(owner_id,conversation_id);
CREATE TABLE ecoach_proposals (
 id uuid PRIMARY KEY,owner_id uuid NOT NULL,conversation_id uuid NOT NULL,operation_id uuid NOT NULL,
 action jsonb NOT NULL,state text NOT NULL DEFAULT 'pending' CHECK(state IN('pending','applied','rejected')),
 result_id uuid,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '24 hours',
 UNIQUE(owner_id,operation_id),FOREIGN KEY(owner_id,conversation_id) REFERENCES ecoach_conversations(owner_id,id) ON DELETE CASCADE
);
ALTER TABLE ecoach_turns ADD COLUMN proposal_id uuid REFERENCES ecoach_proposals(id) ON DELETE SET NULL;
ALTER TABLE ecoach_turns ADD COLUMN sources jsonb NOT NULL DEFAULT '[]';
ALTER TABLE ecoach_turns ADD COLUMN mode text NOT NULL DEFAULT 'demo' CHECK(mode IN('demo','ai'));
