-- Operator-only erasure ledger. No FKs to erased subjects: survives their removal.
CREATE TABLE privacy_erasure_jobs (
 id uuid PRIMARY KEY,
 owner_id uuid NOT NULL,
 scope text NOT NULL CHECK(scope IN ('student','professional')),
 subject_id uuid NOT NULL,
 approval_reference uuid NOT NULL,
 state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','blocked','cleaning','waiting','completed')),
 blocker text CHECK(blocker IN ('account_not_suspended','financial_retention','shared_contribution','related_history','external_storage','quiescence')),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 not_before timestamptz NOT NULL DEFAULT clock_timestamp()+interval '1 day',
 completed_at timestamptz,
 lease_id uuid, lease_until timestamptz,
 CHECK(scope<>'professional' OR subject_id=owner_id),
 CHECK((state='completed')=(completed_at IS NOT NULL))
);
CREATE UNIQUE INDEX privacy_erasure_one_subject ON privacy_erasure_jobs(owner_id,scope,subject_id);
CREATE INDEX privacy_erasure_work ON privacy_erasure_jobs(state,created_at,id);
CREATE TABLE privacy_erasure_objects (
 job_id uuid NOT NULL REFERENCES privacy_erasure_jobs(id),
 object_key text NOT NULL,
 cleanup_due_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 last_deleted_at timestamptz,
 attempts integer NOT NULL DEFAULT 0 CHECK(attempts>=0),
 PRIMARY KEY(job_id,object_key)
);
CREATE INDEX privacy_erasure_cleanup ON privacy_erasure_objects(cleanup_due_at,job_id);
-- Keep batch-operation idempotency even when one result was lawfully erased.
ALTER TABLE workout_operation_keys ADD COLUMN invalidated_at timestamptz;
