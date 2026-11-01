ALTER TABLE student_links ADD CONSTRAINT student_links_owner_identity UNIQUE(professional_id,id);
CREATE TABLE workout_plans (
 id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES users(id),
 kind text NOT NULL CHECK(kind IN('individual','template')), student_link_id uuid,
 state text NOT NULL CHECK(state IN('draft','active','archived')), version integer NOT NULL CHECK(version>0),
 name varchar(160) NOT NULL, name_key text NOT NULL, document jsonb NOT NULL,
 source_template_id uuid, source_template_version integer, copied_from_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(owner_id,id), CHECK((kind='individual' AND student_link_id IS NOT NULL) OR(kind='template' AND student_link_id IS NULL)),
 FOREIGN KEY(owner_id,student_link_id) REFERENCES student_links(professional_id,id),
 FOREIGN KEY(owner_id,source_template_id) REFERENCES workout_plans(owner_id,id),
 FOREIGN KEY(owner_id,copied_from_id) REFERENCES workout_plans(owner_id,id)
);
CREATE UNIQUE INDEX workout_one_active_student ON workout_plans(owner_id,student_link_id) WHERE kind='individual' AND state='active';
CREATE INDEX workout_owner_list ON workout_plans(owner_id,kind,state,updated_at DESC,id);
CREATE INDEX workout_student ON workout_plans(owner_id,student_link_id,state);
CREATE TABLE workout_versions (
 plan_id uuid NOT NULL, owner_id uuid NOT NULL, version integer NOT NULL,
 state text NOT NULL CHECK(state IN('draft','active','archived')), document jsonb NOT NULL,
 identity_snapshot jsonb NOT NULL, actor_id uuid NOT NULL REFERENCES users(id),
 operation text NOT NULL CHECK(operation IN('created','edited','duplicated','applied','activated','drafted','archived')),
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(plan_id,version),
 UNIQUE(owner_id,plan_id,version), FOREIGN KEY(owner_id,plan_id) REFERENCES workout_plans(owner_id,id)
);
ALTER TABLE workout_plans ADD CONSTRAINT workout_template_revision FOREIGN KEY(owner_id,source_template_id,source_template_version) REFERENCES workout_versions(owner_id,plan_id,version);
CREATE TABLE workout_exercise_references (
 owner_id uuid NOT NULL, plan_id uuid NOT NULL, plan_version integer NOT NULL,
 division_id uuid NOT NULL, item_id uuid NOT NULL, exercise_id uuid NOT NULL, exercise_version integer NOT NULL,
 PRIMARY KEY(plan_id,plan_version,item_id),
 FOREIGN KEY(owner_id,plan_id,plan_version) REFERENCES workout_versions(owner_id,plan_id,version),
 FOREIGN KEY(exercise_id,exercise_version) REFERENCES exercise_versions(exercise_id,version)
);
CREATE TABLE workout_operation_keys (
 owner_id uuid NOT NULL REFERENCES users(id), operation_key uuid NOT NULL,
 digest text NOT NULL, result_ids uuid[] NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(owner_id,operation_key)
);
