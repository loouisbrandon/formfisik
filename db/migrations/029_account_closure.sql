-- Closure requests survive account erasure as a minimal operational tombstone.
CREATE TABLE account_closures (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL UNIQUE,
 effective_at timestamptz NOT NULL,
 requested_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 processed_at timestamptz,
 state text NOT NULL DEFAULT 'scheduled' CHECK(state IN ('scheduled','closed')),
 CHECK((state='closed')=(processed_at IS NOT NULL))
);
CREATE INDEX account_closures_due ON account_closures(effective_at,id) WHERE state='scheduled';
