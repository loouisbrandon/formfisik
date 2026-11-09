CREATE TABLE admin_privacy_decisions (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 request_id uuid NOT NULL REFERENCES settings_privacy_requests(id) ON DELETE CASCADE,
 actor_id uuid NOT NULL,
 previous_state text NOT NULL CHECK(previous_state IN ('pending','processing')),
 new_state text NOT NULL CHECK(new_state IN ('processing','completed','denied')),
 justification varchar(1000) NOT NULL CHECK(length(trim(justification))>=10),
 reference varchar(120) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX admin_privacy_decisions_request ON admin_privacy_decisions(request_id,created_at DESC,id DESC);
