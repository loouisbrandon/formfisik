CREATE TABLE professional_services (
 id uuid PRIMARY KEY, professional_id uuid NOT NULL REFERENCES users(id),
 name varchar(100) NOT NULL, category text NOT NULL CHECK(category IN('online','onsite','session','assessment','workout','custom')),
 document jsonb NOT NULL, archived boolean NOT NULL DEFAULT false, version integer NOT NULL DEFAULT 1 CHECK(version>0),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(), UNIQUE(professional_id,id)
);
CREATE INDEX professional_services_list ON professional_services(professional_id,archived,lower(name),id);
CREATE TABLE professional_service_plans (
 id uuid PRIMARY KEY, professional_id uuid NOT NULL REFERENCES users(id), service_id uuid NOT NULL, name varchar(100) NOT NULL,
 document jsonb NOT NULL, version integer NOT NULL DEFAULT 1 CHECK(version>0), archived boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),UNIQUE(professional_id,id),
 FOREIGN KEY(professional_id,service_id) REFERENCES professional_services(professional_id,id)
);
CREATE INDEX professional_plans_list ON professional_service_plans(professional_id,archived,service_id,lower(name),id);
CREATE TABLE professional_plan_versions (
 professional_id uuid NOT NULL,plan_id uuid NOT NULL,version integer NOT NULL,document jsonb NOT NULL,
 actor_id uuid NOT NULL REFERENCES users(id),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),PRIMARY KEY(professional_id,plan_id,version),
 FOREIGN KEY(professional_id,plan_id) REFERENCES professional_service_plans(professional_id,id),CHECK(actor_id=professional_id)
);
CREATE TABLE professional_contracts (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL REFERENCES users(id),student_link_id uuid NOT NULL,service_id uuid NOT NULL,plan_id uuid NOT NULL,plan_version integer NOT NULL,
 agreement jsonb NOT NULL,price_cents integer NOT NULL CHECK(price_cents BETWEEN 0 AND 1000000000),currency text NOT NULL DEFAULT 'brl' CHECK(currency='brl'),
 starts_on date NOT NULL,ends_on date NOT NULL CHECK(ends_on>=starts_on),sessions integer CHECK(sessions BETWEEN 1 AND 1000),administrative_notes varchar(1500) NOT NULL DEFAULT '',
 state text NOT NULL DEFAULT 'draft' CHECK(state IN('draft','active','suspended','completed','canceled')),version integer NOT NULL DEFAULT 1 CHECK(version>0),
 previous_id uuid,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),UNIQUE(professional_id,id),UNIQUE(professional_id,id,student_link_id),UNIQUE(professional_id,previous_id),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),
 FOREIGN KEY(professional_id,service_id) REFERENCES professional_services(professional_id,id),
 FOREIGN KEY(professional_id,plan_id,plan_version) REFERENCES professional_plan_versions(professional_id,plan_id,version),
 FOREIGN KEY(professional_id,previous_id) REFERENCES professional_contracts(professional_id,id)
);
CREATE INDEX professional_contracts_student ON professional_contracts(professional_id,student_link_id,state,ends_on,id);
CREATE INDEX professional_contracts_list ON professional_contracts(professional_id,state,ends_on,id);
CREATE TABLE professional_contract_versions (
 professional_id uuid NOT NULL,contract_id uuid NOT NULL,version integer NOT NULL,document jsonb NOT NULL,actor_id uuid NOT NULL REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),PRIMARY KEY(professional_id,contract_id,version),
 FOREIGN KEY(professional_id,contract_id) REFERENCES professional_contracts(professional_id,id),CHECK(actor_id=professional_id)
);
CREATE TABLE professional_deliveries (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL,contract_id uuid NOT NULL,student_link_id uuid NOT NULL,
 definition jsonb NOT NULL,name varchar(120) NOT NULL,type text NOT NULL CHECK(type IN('workout','assessment','intake','session','followup','feedback','custom')),
 quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 1000),required boolean NOT NULL,due_on date NOT NULL,position integer NOT NULL CHECK(position>0),
 state text NOT NULL DEFAULT 'pending' CHECK(state IN('pending','in_progress','completed','canceled')),version integer NOT NULL DEFAULT 1 CHECK(version>0),
 completed_at timestamptz,UNIQUE(professional_id,id),UNIQUE(professional_id,id,student_link_id),UNIQUE(contract_id,position),
 FOREIGN KEY(professional_id,contract_id,student_link_id) REFERENCES professional_contracts(professional_id,id,student_link_id),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),CHECK((state='completed')=(completed_at IS NOT NULL))
);
CREATE INDEX professional_deliveries_pending ON professional_deliveries(professional_id,student_link_id,state,due_on,id);
CREATE INDEX professional_deliveries_contract ON professional_deliveries(professional_id,contract_id,position,id);
CREATE TABLE professional_delivery_executions (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL,delivery_id uuid NOT NULL,student_link_id uuid NOT NULL,units integer NOT NULL CHECK(units BETWEEN 1 AND 1000),
 evidence_type text CHECK(evidence_type IN('workout','assessment','intake')),evidence_id uuid,evidence_version integer,evidence_date date,
 note varchar(1000) NOT NULL DEFAULT '',actor_id uuid NOT NULL REFERENCES users(id),occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),voided_at timestamptz,void_reason varchar(1000),
 FOREIGN KEY(professional_id,delivery_id,student_link_id) REFERENCES professional_deliveries(professional_id,id,student_link_id),FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),CHECK(actor_id=professional_id),
 CHECK((evidence_type IS NULL AND evidence_id IS NULL AND evidence_version IS NULL AND evidence_date IS NULL) OR(evidence_type IS NOT NULL AND evidence_id IS NOT NULL AND evidence_version IS NOT NULL AND evidence_date IS NOT NULL))
);
CREATE INDEX professional_execution_delivery ON professional_delivery_executions(professional_id,delivery_id,occurred_at DESC,id);
CREATE UNIQUE INDEX professional_execution_evidence ON professional_delivery_executions(professional_id,delivery_id,evidence_type,evidence_id,evidence_version) WHERE voided_at IS NULL AND evidence_id IS NOT NULL;
CREATE TABLE professional_commercial_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,professional_id uuid NOT NULL REFERENCES users(id),actor_id uuid NOT NULL REFERENCES users(id),
 student_link_id uuid,service_id uuid,plan_id uuid,contract_id uuid,delivery_id uuid,kind text NOT NULL,version integer NOT NULL,detail jsonb NOT NULL DEFAULT '{}',reason varchar(1000) NOT NULL DEFAULT '',occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),CHECK(actor_id=professional_id)
);
CREATE INDEX professional_commercial_events_owner ON professional_commercial_events(professional_id,id DESC);
CREATE INDEX professional_commercial_events_contract ON professional_commercial_events(professional_id,contract_id,id DESC);
CREATE TABLE professional_commercial_operations (
 professional_id uuid NOT NULL REFERENCES users(id),operation_key uuid NOT NULL,digest text NOT NULL,student_link_id uuid,result jsonb NOT NULL,invalidated_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),PRIMARY KEY(professional_id,operation_key)
);
CREATE FUNCTION professional_agreement_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'IMMUTABLE_COMMERCIAL_VERSION'; END $$;
CREATE TRIGGER professional_plan_version_immutable BEFORE UPDATE ON professional_plan_versions FOR EACH ROW EXECUTE FUNCTION professional_agreement_immutable();
CREATE TRIGGER professional_contract_version_immutable BEFORE UPDATE ON professional_contract_versions FOR EACH ROW EXECUTE FUNCTION professional_agreement_immutable();
