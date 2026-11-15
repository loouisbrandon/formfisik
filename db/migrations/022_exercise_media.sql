-- Marco023: migration022 follows the actual sequential history001–021.
CREATE TABLE exercise_videos (
 id uuid PRIMARY KEY,owner_id uuid NOT NULL REFERENCES users(id),scope text NOT NULL DEFAULT 'private' CHECK(scope IN('private','official')),
 state text NOT NULL DEFAULT 'active' CHECK(state IN('active','archived','revoked')),version integer NOT NULL DEFAULT 1 CHECK(version>0),
 submitted boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),UNIQUE(owner_id,id)
);
CREATE TABLE exercise_video_versions (
 video_id uuid NOT NULL REFERENCES exercise_videos(id),revision integer NOT NULL CHECK(revision>0),
 source text NOT NULL CHECK(source IN('youtube','stream')),external_id text,
 title varchar(160) NOT NULL,description varchar(2000) NOT NULL,rights_reference varchar(500) NOT NULL,
 author_id uuid NOT NULL REFERENCES users(id),people_authorized boolean NOT NULL CHECK(people_authorized),
 processing text NOT NULL CHECK(processing IN('reserved','processing','ready','failed','deleted')),
 declared_bytes bigint NOT NULL DEFAULT 0 CHECK(declared_bytes BETWEEN 0 AND 200000000),reserved_seconds integer NOT NULL CHECK(reserved_seconds BETWEEN 0 AND 300),
 seconds numeric,upload_expires_at timestamptz,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(video_id,revision),CHECK((source='youtube' AND external_id ~ '^[A-Za-z0-9_-]{11}$' AND reserved_seconds=0) OR source='stream'),
 CHECK(seconds IS NULL OR seconds BETWEEN 0 AND 300)
);
CREATE INDEX media_stream_uid ON exercise_video_versions(external_id) WHERE source='stream' AND external_id IS NOT NULL;
CREATE INDEX media_owner ON exercise_videos(owner_id,state,updated_at DESC,id);
CREATE TABLE exercise_video_sets (
 id uuid PRIMARY KEY,exercise_id uuid NOT NULL REFERENCES exercise_entries(id),owner_id uuid NOT NULL REFERENCES users(id),scope text NOT NULL CHECK(scope IN('private','official')),version integer NOT NULL CHECK(version>0),
 UNIQUE(exercise_id,owner_id,scope)
);
CREATE UNIQUE INDEX media_official_set ON exercise_video_sets(exercise_id) WHERE scope='official';
CREATE TABLE exercise_video_set_versions (
 set_id uuid NOT NULL REFERENCES exercise_video_sets(id) ON DELETE CASCADE,version integer NOT NULL,actor_id uuid NOT NULL REFERENCES users(id),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),PRIMARY KEY(set_id,version)
);
CREATE TABLE exercise_video_set_items (
 set_id uuid NOT NULL,version integer NOT NULL,position integer NOT NULL CHECK(position BETWEEN 0 AND 9),video_id uuid NOT NULL,video_revision integer NOT NULL,
 PRIMARY KEY(set_id,version,position),UNIQUE(set_id,version,video_id),FOREIGN KEY(set_id,version) REFERENCES exercise_video_set_versions(set_id,version) ON DELETE CASCADE,
 FOREIGN KEY(video_id,video_revision) REFERENCES exercise_video_versions(video_id,revision)
);
CREATE TABLE workout_video_references (
 owner_id uuid NOT NULL,plan_id uuid NOT NULL,plan_version integer NOT NULL,item_id uuid NOT NULL,position integer NOT NULL CHECK(position BETWEEN 0 AND 9),video_id uuid NOT NULL,video_revision integer NOT NULL,
 PRIMARY KEY(plan_id,plan_version,item_id,position),FOREIGN KEY(owner_id,plan_id,plan_version) REFERENCES workout_versions(owner_id,plan_id,version) ON DELETE CASCADE,
 FOREIGN KEY(video_id,video_revision) REFERENCES exercise_video_versions(video_id,revision)
);
CREATE TABLE media_operations(owner_id uuid NOT NULL REFERENCES users(id),operation_key uuid NOT NULL,digest char(64) NOT NULL,result jsonb NOT NULL,PRIMARY KEY(owner_id,operation_key));
CREATE TABLE media_events(id bigserial PRIMARY KEY,owner_id uuid NOT NULL REFERENCES users(id),video_id uuid REFERENCES exercise_videos(id),exercise_id uuid REFERENCES exercise_entries(id),actor_id uuid NOT NULL REFERENCES users(id),kind text NOT NULL,reason varchar(500) NOT NULL DEFAULT '',occurred_at timestamptz NOT NULL DEFAULT clock_timestamp());
-- Durable remote deletion receipts survive account erasure. No source bytes/titles/people.
CREATE TABLE media_cleanup(provider_id text PRIMARY KEY CHECK(provider_id ~ '^[a-f0-9]{32}$'),deleted_at timestamptz,due_at timestamptz NOT NULL DEFAULT clock_timestamp(),attempts integer NOT NULL DEFAULT 0);
CREATE TABLE media_publishers(user_id uuid PRIMARY KEY REFERENCES users(id),granted_by uuid NOT NULL REFERENCES users(id),granted_at timestamptz NOT NULL DEFAULT clock_timestamp(),revoked_at timestamptz);
