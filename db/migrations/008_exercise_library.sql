CREATE TABLE exercise_datasets (
 id text PRIMARY KEY, revision text NOT NULL, license text NOT NULL,
 source_url text NOT NULL, checksum text NOT NULL, imported_at timestamptz NOT NULL DEFAULT now(),
 audit jsonb NOT NULL
);
CREATE TABLE exercise_entries (
 id uuid PRIMARY KEY,
 scope text NOT NULL CHECK(scope IN ('official','private')),
 owner_id uuid REFERENCES users(id),
 state text NOT NULL CHECK(state IN ('published','active','archived','review')),
 version integer NOT NULL DEFAULT 1 CHECK(version>0),
 name varchar(160) NOT NULL CHECK(length(trim(name))>=2),
 name_key text NOT NULL, search_text text NOT NULL,
 category text NOT NULL, primary_muscles text[] NOT NULL CHECK(cardinality(primary_muscles)>0),
 secondary_muscles text[] NOT NULL DEFAULT '{}', equipment text, level text,
 instructions text[] NOT NULL DEFAULT '{}', aliases text[] NOT NULL DEFAULT '{}',
 source_dataset text REFERENCES exercise_datasets(id), source_id text, source_digest text,
 quality_flags text[] NOT NULL DEFAULT '{}', source_metadata jsonb NOT NULL DEFAULT '{}',
 variation_of uuid REFERENCES exercise_entries(id),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK((scope='official' AND owner_id IS NULL AND state IN ('published','review','archived')) OR (scope='private' AND owner_id IS NOT NULL AND state IN ('active','archived'))),
 UNIQUE(source_dataset,source_id), UNIQUE(id,owner_id), UNIQUE(id,scope)
);
CREATE INDEX exercise_official_search ON exercise_entries(name_key,id) WHERE scope='official' AND state='published';
CREATE INDEX exercise_private_owner ON exercise_entries(owner_id,state,name_key,id) WHERE scope='private';
CREATE INDEX exercise_category ON exercise_entries(category,state);
CREATE INDEX exercise_muscles ON exercise_entries USING gin(primary_muscles);
CREATE TABLE exercise_versions (
 exercise_id uuid NOT NULL REFERENCES exercise_entries(id), version integer NOT NULL,
 definition jsonb NOT NULL, actor_id uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(exercise_id,version)
);
CREATE TABLE exercise_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 exercise_id uuid NOT NULL, version integer NOT NULL, actor_id uuid REFERENCES users(id),
 kind text NOT NULL CHECK(kind IN ('imported','created','edited','archived','reactivated','published')),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(exercise_id,version) REFERENCES exercise_versions(exercise_id,version), UNIQUE(exercise_id,version)
);
CREATE TABLE exercise_moderators (
 user_id uuid PRIMARY KEY REFERENCES users(id), granted_by uuid REFERENCES users(id),
 granted_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz,
 reason varchar(500) NOT NULL CHECK(length(trim(reason))>=10),
 provisioning text NOT NULL CHECK(provisioning IN ('operator_verified'))
);
CREATE TABLE exercise_moderator_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id),
 kind text NOT NULL CHECK(kind IN ('grant','revoke')), reason varchar(500) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE exercise_requests (
 id uuid PRIMARY KEY, requested_by uuid NOT NULL REFERENCES users(id),
 proposal jsonb NOT NULL,
 private_exercise_id uuid, resubmission_of uuid REFERENCES exercise_requests(id),
 state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','approved','linked_existing','rejected')),
 version integer NOT NULL DEFAULT 1 CHECK(version>0),
 creation_key uuid NOT NULL, creation_digest text NOT NULL,
 decision_reason varchar(1000), decided_by uuid REFERENCES users(id), decided_at timestamptz,
 published_exercise_id uuid, target_scope text NOT NULL DEFAULT 'official' CHECK(target_scope='official'),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(requested_by,creation_key),
 FOREIGN KEY(private_exercise_id,requested_by) REFERENCES exercise_entries(id,owner_id),
 FOREIGN KEY(published_exercise_id,target_scope) REFERENCES exercise_entries(id,scope),
 CHECK(decided_by IS NULL OR decided_by<>requested_by),
 CHECK((state='pending' AND decided_by IS NULL AND decided_at IS NULL AND published_exercise_id IS NULL) OR
 (state IN ('approved','linked_existing') AND decided_by IS NOT NULL AND decided_at IS NOT NULL AND published_exercise_id IS NOT NULL) OR
 (state='rejected' AND decided_by IS NOT NULL AND decided_at IS NOT NULL AND published_exercise_id IS NULL AND length(trim(decision_reason))>=10))
);
CREATE INDEX exercise_request_owner ON exercise_requests(requested_by,state,created_at DESC,id);
CREATE INDEX exercise_request_pending ON exercise_requests(state,created_at,id);
CREATE TABLE exercise_request_events (
 request_id uuid NOT NULL REFERENCES exercise_requests(id), version integer NOT NULL,
 actor_id uuid NOT NULL REFERENCES users(id), kind text NOT NULL CHECK(kind IN ('submitted','approved','linked_existing','rejected')),
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(request_id,version)
);
CREATE TABLE exercise_creation_keys (
 owner_id uuid NOT NULL REFERENCES users(id), creation_key uuid NOT NULL,
 exercise_id uuid NOT NULL, digest text NOT NULL,
 PRIMARY KEY(owner_id,creation_key), FOREIGN KEY(exercise_id,owner_id) REFERENCES exercise_entries(id,owner_id)
);
