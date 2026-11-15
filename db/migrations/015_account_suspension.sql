-- Account suspension is independent from subscription/cancellation and erasure.
ALTER TABLE users ADD COLUMN disabled_at timestamptz;
CREATE TABLE account_security_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES users(id),
 kind text NOT NULL CHECK(kind IN ('disabled','enabled')),
 reason text NOT NULL CHECK(reason IN ('owner_request','security_incident','administrative_review')),
 occurred_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX account_security_events_user_time ON account_security_events(user_id,occurred_at);
CREATE FUNCTION invalidate_disabled_account() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.disabled_at IS NOT NULL AND OLD.disabled_at IS NULL THEN
  UPDATE sessions SET revoked_at=clock_timestamp() WHERE user_id=NEW.id AND revoked_at IS NULL;
  DELETE FROM password_resets WHERE user_id=NEW.id;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER disable_account_credentials AFTER UPDATE OF disabled_at ON users
 FOR EACH ROW EXECUTE FUNCTION invalidate_disabled_account();
