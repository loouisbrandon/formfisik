-- Internal agenda only; no external calendar credentials, sync tables or speculative provider entities.
CREATE TABLE agenda_settings (
 professional_id uuid PRIMARY KEY REFERENCES users(id),timezone varchar(80) NOT NULL DEFAULT 'America/Sao_Paulo',
 weekly jsonb NOT NULL DEFAULT '[]',version integer NOT NULL DEFAULT 1 CHECK(version>0),updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE agenda_exceptions (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL REFERENCES agenda_settings(professional_id),local_date date NOT NULL,windows jsonb NOT NULL,
 reason varchar(300) NOT NULL DEFAULT '',version integer NOT NULL DEFAULT 1 CHECK(version>0),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(professional_id,id),UNIQUE(professional_id,local_date)
);
CREATE TABLE agenda_session_types (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL REFERENCES agenda_settings(professional_id),name varchar(100) NOT NULL,document jsonb NOT NULL,
 archived boolean NOT NULL DEFAULT false,version integer NOT NULL DEFAULT 1 CHECK(version>0),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),UNIQUE(professional_id,id)
);
CREATE TABLE agenda_series (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL REFERENCES agenda_settings(professional_id),student_link_id uuid,parent_id uuid,document jsonb NOT NULL,
 version integer NOT NULL DEFAULT 1 CHECK(version>0),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),UNIQUE(professional_id,id),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),FOREIGN KEY(professional_id,parent_id) REFERENCES agenda_series(professional_id,id)
);
CREATE TABLE agenda_occurrences (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL REFERENCES agenda_settings(professional_id),series_id uuid,position integer NOT NULL DEFAULT 1,
 student_link_id uuid,type_id uuid,kind text NOT NULL CHECK(kind IN('session','personal','block')),title varchar(120) NOT NULL,type_snapshot jsonb,
 starts_at timestamptz NOT NULL,ends_at timestamptz NOT NULL,occupied_start timestamptz NOT NULL,occupied_end timestamptz NOT NULL,
 timezone varchar(80) NOT NULL,local_date date NOT NULL,local_time varchar(5) NOT NULL,fold text NOT NULL CHECK(fold IN('reject','earlier','later')),
 mode text NOT NULL CHECK(mode IN('onsite','online','external')),location varchar(200) NOT NULL DEFAULT '',notes varchar(1500) NOT NULL DEFAULT '',
 contract_id uuid,delivery_id uuid,state text NOT NULL DEFAULT 'scheduled' CHECK(state IN('scheduled','completed','absent','canceled')),
 effective_at timestamptz,recorded_at timestamptz,actor_id uuid REFERENCES users(id),late_canceled boolean NOT NULL DEFAULT false,
 version integer NOT NULL DEFAULT 1 CHECK(version>0),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(professional_id,id),UNIQUE(series_id,position),
 FOREIGN KEY(professional_id,series_id) REFERENCES agenda_series(professional_id,id),FOREIGN KEY(professional_id,type_id) REFERENCES agenda_session_types(professional_id,id),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),
 FOREIGN KEY(professional_id,contract_id,student_link_id) REFERENCES professional_contracts(professional_id,id,student_link_id),
 FOREIGN KEY(professional_id,delivery_id,student_link_id) REFERENCES professional_deliveries(professional_id,id,student_link_id),
 CHECK(ends_at>starts_at),CHECK(occupied_start<=starts_at AND occupied_end>=ends_at),CHECK(actor_id IS NULL OR actor_id=professional_id),
 CHECK((kind='session' AND student_link_id IS NOT NULL AND type_id IS NOT NULL) OR(kind<>'session' AND student_link_id IS NULL AND contract_id IS NULL AND delivery_id IS NULL)),
 CHECK(delivery_id IS NULL OR contract_id IS NOT NULL),CHECK(state NOT IN('completed','absent') OR effective_at IS NOT NULL)
);
CREATE INDEX agenda_occurrences_period ON agenda_occurrences(professional_id,occupied_start,occupied_end);
CREATE INDEX agenda_occurrences_student ON agenda_occurrences(professional_id,student_link_id,starts_at,id);
CREATE INDEX agenda_occurrences_series ON agenda_occurrences(professional_id,series_id,starts_at,id);
CREATE TABLE agenda_fulfillments (
 professional_id uuid NOT NULL,occurrence_id uuid NOT NULL,execution_id uuid NOT NULL UNIQUE REFERENCES professional_delivery_executions(id),
 delivery_id uuid NOT NULL,released_at timestamptz,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),PRIMARY KEY(professional_id,occurrence_id,execution_id),
 FOREIGN KEY(professional_id,occurrence_id) REFERENCES agenda_occurrences(professional_id,id),FOREIGN KEY(professional_id,delivery_id) REFERENCES professional_deliveries(professional_id,id)
);
CREATE UNIQUE INDEX agenda_fulfillment_active ON agenda_fulfillments(professional_id,occurrence_id) WHERE released_at IS NULL;
CREATE TABLE agenda_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,professional_id uuid NOT NULL REFERENCES agenda_settings(professional_id),student_link_id uuid,occurrence_id uuid,
 actor_id uuid NOT NULL REFERENCES users(id),kind text NOT NULL,version integer NOT NULL,detail jsonb NOT NULL DEFAULT '{}',reason varchar(1000) NOT NULL DEFAULT '',created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),CHECK(actor_id=professional_id)
);
CREATE INDEX agenda_events_owner ON agenda_events(professional_id,id DESC);
CREATE INDEX agenda_events_occurrence ON agenda_events(professional_id,occurrence_id,id DESC);
CREATE TABLE agenda_operations (
 professional_id uuid NOT NULL REFERENCES agenda_settings(professional_id),operation_key uuid NOT NULL,digest text NOT NULL,student_link_id uuid,
 result jsonb NOT NULL,invalidated_at timestamptz,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),PRIMARY KEY(professional_id,operation_key)
);
