-- Service identity only; these receipts grant no user permission.
CREATE TABLE core_service_assertions (
 environment text NOT NULL CHECK(environment IN ('local','staging','production')),
 issuer varchar(120) NOT NULL,
 jti uuid NOT NULL,
 expires_at timestamptz NOT NULL,
 received_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(environment,issuer,jti)
);
CREATE INDEX core_service_assertions_expiry ON core_service_assertions(expires_at);
