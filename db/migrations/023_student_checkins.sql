-- Marco022 follows the actual media migration022. Preserve all previous migrations.
ALTER TABLE intake_forms ADD COLUMN usage text NOT NULL DEFAULT 'intake' CHECK(usage IN('intake','checkin'));
CREATE FUNCTION form_usage_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.usage<>OLD.usage THEN RAISE EXCEPTION 'form purpose immutable'; END IF; RETURN NEW; END $$;
CREATE TRIGGER form_usage_immutable BEFORE UPDATE ON intake_forms FOR EACH ROW EXECUTE FUNCTION form_usage_immutable();
CREATE TABLE checkin_assignments (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL REFERENCES users(id),student_link_id uuid NOT NULL,form_version_id uuid NOT NULL,
 fields jsonb NOT NULL,state text NOT NULL DEFAULT 'active' CHECK(state IN('active','paused','closed')),version integer NOT NULL DEFAULT 1,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(professional_id,id),FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),FOREIGN KEY(professional_id,form_version_id) REFERENCES intake_versions(professional_id,id)
);
CREATE TABLE checkin_occurrences (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL REFERENCES users(id),student_link_id uuid NOT NULL,assignment_id uuid NOT NULL,form_version_id uuid NOT NULL,
 position integer NOT NULL,period_start date NOT NULL,period_end date NOT NULL,opens_at timestamptz NOT NULL,due_at timestamptz NOT NULL,closes_at timestamptz NOT NULL,timezone varchar(80) NOT NULL,
 workout_id uuid,workout_version integer,division_id uuid,expected_workouts integer CHECK(expected_workouts BETWEEN 1 AND 100),
 state text NOT NULL DEFAULT 'waiting' CHECK(state IN('waiting','received','reviewing','reviewed','canceled')),version integer NOT NULL DEFAULT 1,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(professional_id,id),UNIQUE(assignment_id,position),FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),
 FOREIGN KEY(professional_id,assignment_id) REFERENCES checkin_assignments(professional_id,id),FOREIGN KEY(professional_id,form_version_id) REFERENCES intake_versions(professional_id,id),
 FOREIGN KEY(professional_id,workout_id,workout_version) REFERENCES workout_versions(owner_id,plan_id,version),
 CHECK(period_end>=period_start),CHECK(opens_at<due_at AND due_at<=closes_at),CHECK((workout_id IS NULL)=(workout_version IS NULL)),CHECK(division_id IS NULL OR workout_id IS NOT NULL)
);
CREATE INDEX checkin_occurrences_owner ON checkin_occurrences(professional_id,due_at,id);
CREATE INDEX checkin_occurrences_student ON checkin_occurrences(professional_id,student_link_id,period_end,id);
CREATE TABLE checkin_invitations (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL,occurrence_id uuid NOT NULL,token_digest char(64) NOT NULL UNIQUE,
 base_revision integer NOT NULL DEFAULT 0,expires_at timestamptz NOT NULL,revoked_at timestamptz,consumed_at timestamptz,attempt_key uuid,attempt_digest char(64),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(professional_id,id),FOREIGN KEY(professional_id,occurrence_id) REFERENCES checkin_occurrences(professional_id,id)
);
CREATE TABLE checkin_submissions (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL,student_link_id uuid NOT NULL,occurrence_id uuid NOT NULL,invitation_id uuid NOT NULL UNIQUE,revision integer NOT NULL CHECK(revision>0),
 answers jsonb NOT NULL,feedback jsonb NOT NULL,source text NOT NULL DEFAULT 'student_link' CHECK(source='student_link'),acknowledged_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(professional_id,id),UNIQUE(occurrence_id,revision),FOREIGN KEY(professional_id,occurrence_id) REFERENCES checkin_occurrences(professional_id,id),
 FOREIGN KEY(professional_id,invitation_id) REFERENCES checkin_invitations(professional_id,id),FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id)
);
CREATE TRIGGER checkin_submission_immutable BEFORE UPDATE ON checkin_submissions FOR EACH ROW EXECUTE FUNCTION intake_immutable();
CREATE TABLE checkin_reviews (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL,occurrence_id uuid NOT NULL,submission_id uuid NOT NULL,actor_id uuid NOT NULL REFERENCES users(id),
 text varchar(4000) NOT NULL,shared_manually boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(professional_id,occurrence_id) REFERENCES checkin_occurrences(professional_id,id),FOREIGN KEY(professional_id,submission_id) REFERENCES checkin_submissions(professional_id,id),CHECK(actor_id=professional_id)
);
CREATE TRIGGER checkin_review_immutable BEFORE UPDATE ON checkin_reviews FOR EACH ROW EXECUTE FUNCTION intake_immutable();
CREATE TABLE checkin_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,professional_id uuid NOT NULL REFERENCES users(id),student_link_id uuid NOT NULL,occurrence_id uuid,kind text NOT NULL,actor_id uuid REFERENCES users(id),detail jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),CHECK(actor_id IS NULL OR actor_id=professional_id)
);
CREATE INDEX checkin_events_owner ON checkin_events(professional_id,id DESC);
CREATE TABLE checkin_operations (
 professional_id uuid NOT NULL REFERENCES users(id),operation_key uuid NOT NULL,digest char(64) NOT NULL,student_link_id uuid,result jsonb NOT NULL,invalidated_at timestamptz,PRIMARY KEY(professional_id,operation_key)
);
