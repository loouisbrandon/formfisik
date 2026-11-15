-- Existing staging grants retain their original authorization and unlimited duration.
ALTER TABLE complimentary_access_grants DROP CONSTRAINT complimentary_access_grants_environment_check;
ALTER TABLE complimentary_access_grants ADD CONSTRAINT complimentary_access_grants_environment_check CHECK(environment IN ('local','staging'));
ALTER TABLE complimentary_access_grants ADD COLUMN expires_at timestamptz;
ALTER TABLE complimentary_access_grants ADD CONSTRAINT complimentary_expiry CHECK(expires_at IS NULL OR expires_at>granted_at);
ALTER TABLE complimentary_access_events ADD COLUMN actor_id uuid;
ALTER TABLE complimentary_access_events ADD COLUMN justification varchar(1000);
ALTER TABLE complimentary_access_events ADD CONSTRAINT complimentary_justification CHECK(justification IS NULL OR length(trim(justification))>=10);
CREATE INDEX complimentary_admin_listing ON complimentary_access_grants(environment,granted_at DESC,id);
