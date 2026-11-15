CREATE TABLE communication_assistance_settings (
 owner_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 version integer NOT NULL DEFAULT 1 CHECK(version>0),
 consent_fingerprint text,
 updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE communication_inbox_threads (
 id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 student_link_id uuid, name text NOT NULL CHECK(length(name) BETWEEN 2 AND 120),
 contact text NOT NULL DEFAULT '' CHECK(length(contact)<=160), channel text NOT NULL CHECK(channel IN ('whatsapp','instagram','email')),
 state text NOT NULL DEFAULT 'open' CHECK(state IN ('open','closed')), ai_allowed boolean NOT NULL DEFAULT false,
 version integer NOT NULL DEFAULT 1 CHECK(version>0), created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(owner_id,id), FOREIGN KEY(owner_id,student_link_id) REFERENCES student_links(professional_id,id) ON DELETE CASCADE
);
CREATE INDEX communication_inbox_threads_list ON communication_inbox_threads(owner_id,updated_at DESC,id);
CREATE TABLE communication_inbox_rules (
 id uuid PRIMARY KEY,owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 version integer NOT NULL DEFAULT 1 CHECK(version>0), fields jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),UNIQUE(owner_id,id)
);
CREATE TABLE communication_inbox_messages (
 id uuid PRIMARY KEY, owner_id uuid NOT NULL,thread_id uuid NOT NULL,
 body text NOT NULL CHECK(length(body) BETWEEN 1 AND 4000),direction text NOT NULL CHECK(direction IN ('inbound','outbound')),
 state text NOT NULL CHECK(state IN ('received','draft','approved','discarded')), source text NOT NULL CHECK(source IN ('manual','ai')),
 version integer NOT NULL DEFAULT 1 CHECK(version>0),based_on uuid,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), UNIQUE(owner_id,id),
 FOREIGN KEY(owner_id,thread_id) REFERENCES communication_inbox_threads(owner_id,id) ON DELETE CASCADE,
 CHECK((direction='inbound' AND state='received' AND source='manual') OR (direction='outbound' AND state<>'received'))
);
CREATE INDEX communication_inbox_messages_list ON communication_inbox_messages(owner_id,thread_id,created_at DESC,id);
CREATE TABLE communication_inbox_jobs (
 id uuid PRIMARY KEY,owner_id uuid NOT NULL,thread_id uuid NOT NULL,input_id uuid NOT NULL,
 rule_id uuid,rule_version integer,thread_version integer NOT NULL,
 instructions text NOT NULL DEFAULT '' CHECK(length(instructions)<=1000),
 state text NOT NULL DEFAULT 'queued' CHECK(state IN ('queued','running','done','failed','canceled')),
 attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 3),
 result_id uuid, failure text CHECK(length(failure)<=250),lease_until timestamptz,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),UNIQUE(owner_id,id),
 FOREIGN KEY(owner_id,thread_id) REFERENCES communication_inbox_threads(owner_id,id) ON DELETE CASCADE,
 FOREIGN KEY(owner_id,input_id) REFERENCES communication_inbox_messages(owner_id,id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX communication_inbox_job_source ON communication_inbox_jobs(owner_id,input_id,rule_id) WHERE rule_id IS NOT NULL;
CREATE INDEX communication_inbox_jobs_list ON communication_inbox_jobs(owner_id,created_at DESC,id);
CREATE TABLE communication_inbox_events (
 id uuid PRIMARY KEY,owner_id uuid NOT NULL,thread_id uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN ('created','received','updated','drafted','approved','discarded','ai_queued','ai_started','ai_done','ai_failed','ai_canceled','ai_retried')),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(owner_id,thread_id) REFERENCES communication_inbox_threads(owner_id,id) ON DELETE CASCADE
);
CREATE TABLE communication_inbox_operations (
 owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,operation_key uuid NOT NULL,
 digest text NOT NULL CHECK(length(digest)=64),thread_id uuid,result jsonb NOT NULL,
 PRIMARY KEY(owner_id,operation_key)
);
