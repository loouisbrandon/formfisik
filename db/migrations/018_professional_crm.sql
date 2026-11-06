CREATE TABLE crm_stages (
 id uuid PRIMARY KEY, professional_id uuid NOT NULL REFERENCES users(id),
 name varchar(80) NOT NULL CHECK(length(trim(name))>=2), name_key text NOT NULL,
 description varchar(500) NOT NULL DEFAULT '', color text NOT NULL CHECK(color IN ('lime','blue','violet','amber','rose','slate')),
 position integer NOT NULL CHECK(position>0), active boolean NOT NULL DEFAULT true, archived boolean NOT NULL DEFAULT false,
 rules jsonb NOT NULL DEFAULT '[]', operator text NOT NULL DEFAULT 'all' CHECK(operator IN ('all','any')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(professional_id,id), CHECK(NOT archived OR NOT active)
);
CREATE UNIQUE INDEX crm_stage_name ON crm_stages(professional_id,name_key) WHERE NOT archived;
CREATE TABLE crm_settings (
 professional_id uuid PRIMARY KEY REFERENCES users(id), initial_stage_id uuid NOT NULL,
 version integer NOT NULL DEFAULT 1 CHECK(version>0), recent_days integer NOT NULL DEFAULT 30 CHECK(recent_days BETWEEN 1 AND 365),
 auto_review boolean NOT NULL DEFAULT false, auto_workout boolean NOT NULL DEFAULT false, auto_assessment boolean NOT NULL DEFAULT false,
 FOREIGN KEY(professional_id,initial_stage_id) REFERENCES crm_stages(professional_id,id)
);
CREATE TABLE crm_memberships (
 professional_id uuid NOT NULL, student_link_id uuid NOT NULL, stage_id uuid NOT NULL,
 version integer NOT NULL DEFAULT 1 CHECK(version>0), entered_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(professional_id,student_link_id),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),
 FOREIGN KEY(professional_id,stage_id) REFERENCES crm_stages(professional_id,id)
);
CREATE INDEX crm_membership_stage ON crm_memberships(professional_id,stage_id,entered_at,student_link_id);
CREATE TABLE crm_tasks (
 id uuid PRIMARY KEY, professional_id uuid NOT NULL REFERENCES users(id), student_link_id uuid NOT NULL,
 title varchar(120) NOT NULL CHECK(length(trim(title))>=2), description varchar(1500) NOT NULL DEFAULT '',
 priority text NOT NULL CHECK(priority IN ('low','normal','high','urgent')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','canceled')),
 required boolean NOT NULL DEFAULT false, due_at timestamptz, completed_at timestamptz,
 archived boolean NOT NULL DEFAULT false, version integer NOT NULL DEFAULT 1 CHECK(version>0),
 source text NOT NULL CHECK(source IN ('manual','auto_review','auto_workout','auto_assessment')), origin_key text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(professional_id,id), UNIQUE(professional_id,origin_key),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),
 CHECK((status='completed')=(completed_at IS NOT NULL))
);
CREATE INDEX crm_tasks_student ON crm_tasks(professional_id,student_link_id,archived,status,due_at,id);
CREATE INDEX crm_tasks_list ON crm_tasks(professional_id,archived,updated_at DESC,id);
CREATE TABLE crm_operations (
 professional_id uuid NOT NULL REFERENCES users(id), operation_key uuid NOT NULL, digest text NOT NULL,
 subject_id uuid, result jsonb NOT NULL, invalidated_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(professional_id,operation_key)
);
CREATE TABLE crm_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 professional_id uuid NOT NULL REFERENCES users(id), actor_id uuid NOT NULL REFERENCES users(id),
 student_link_id uuid, task_id uuid, from_stage_id uuid, to_stage_id uuid,
 kind text NOT NULL CHECK(kind IN ('stage_created','stage_edited','stages_reordered','stage_archived','stage_deactivated','enrolled','moved','task_created','task_edited','task_status','task_archived','settings_changed')),
 origin text NOT NULL CHECK(origin IN ('manual','automatic','initialization')),
 validation jsonb NOT NULL DEFAULT '{}', occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),
 FOREIGN KEY(professional_id,task_id) REFERENCES crm_tasks(professional_id,id), CHECK(actor_id=professional_id)
);
CREATE INDEX crm_events_owner ON crm_events(professional_id,id DESC);
CREATE INDEX crm_events_student ON crm_events(professional_id,student_link_id,id DESC);
CREATE INDEX crm_events_task ON crm_events(professional_id,task_id,id DESC);
CREATE INDEX intake_crm_latest ON intake_requests(professional_id,student_link_id,created_at DESC,id DESC);
