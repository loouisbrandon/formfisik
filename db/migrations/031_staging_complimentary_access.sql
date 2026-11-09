-- Operator-provisioned grants; no Stripe subscription, invoice or trial is fabricated.
CREATE TABLE complimentary_access_grants (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL,
 environment text NOT NULL CHECK(environment='staging'),
 reason text NOT NULL CHECK(reason='owner_authorized_test'),
 authorization_reference uuid NOT NULL,
 granted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 revoked_at timestamptz
);
CREATE UNIQUE INDEX complimentary_one_active ON complimentary_access_grants(user_id,environment) WHERE revoked_at IS NULL;
CREATE TABLE complimentary_access_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 grant_id uuid NOT NULL REFERENCES complimentary_access_grants(id),
 operation text NOT NULL CHECK(operation IN ('granted','revoked')),
 authorization_reference uuid NOT NULL,
 occurred_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
