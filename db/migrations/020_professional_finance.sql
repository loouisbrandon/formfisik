-- Independent from billing_* (SaaS). Financial history deliberately RESTRICTs erasure.
CREATE TABLE finance_accounts (
 professional_id uuid PRIMARY KEY REFERENCES users(id),provider_account_id text UNIQUE,
 charges_enabled boolean NOT NULL DEFAULT false,payouts_enabled boolean NOT NULL DEFAULT false,
 status text NOT NULL DEFAULT 'not_connected' CHECK(status IN('not_connected','pending','enabled','restricted')),
 requirements text[] NOT NULL DEFAULT '{}',capabilities jsonb NOT NULL DEFAULT '{}',synced_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE finance_agreements (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL REFERENCES finance_accounts(professional_id),contract_id uuid NOT NULL,student_link_id uuid NOT NULL,
 contract_version integer NOT NULL,amount_cents integer NOT NULL CHECK(amount_cents BETWEEN 1 AND 1000000000),currency text NOT NULL DEFAULT 'brl' CHECK(currency='brl'),
 mode text NOT NULL CHECK(mode IN('one_off','recurring','external','installments')),cycles integer NOT NULL CHECK(cycles BETWEEN 1 AND 120),interval_months integer NOT NULL CHECK(interval_months IN(1,3,6,12)),
 starts_on date NOT NULL,ends_on date NOT NULL CHECK(ends_on>=starts_on),state text NOT NULL DEFAULT 'prepared' CHECK(state IN('prepared','pending','active','cancel_pending','canceled','ended')),
 subscription_id text,version integer NOT NULL DEFAULT 1,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(professional_id,id),UNIQUE(professional_id,id,student_link_id),UNIQUE(professional_id,contract_id),UNIQUE(professional_id,subscription_id),
 FOREIGN KEY(professional_id,contract_id,student_link_id) REFERENCES professional_contracts(professional_id,id,student_link_id)
);
CREATE TABLE finance_charges (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL,agreement_id uuid NOT NULL,student_link_id uuid NOT NULL,cycle integer NOT NULL CHECK(cycle BETWEEN 1 AND 120),
 amount_cents integer NOT NULL CHECK(amount_cents BETWEEN 1 AND 1000000000),currency text NOT NULL DEFAULT 'brl' CHECK(currency='brl'),due_on date NOT NULL,
 state text NOT NULL DEFAULT 'prepared' CHECK(state IN('prepared','open','paid','failed','canceled','refunded','disputed')),
 provider_ref text,paid_cents integer NOT NULL DEFAULT 0,refunded_cents integer NOT NULL DEFAULT 0,disputed_cents integer NOT NULL DEFAULT 0,
 fee_cents integer,net_cents integer,available_on date,paid_on date,version integer NOT NULL DEFAULT 1,
 discrepancy text,synced_at timestamptz,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(professional_id,id),UNIQUE(professional_id,provider_ref),UNIQUE(agreement_id,cycle),
 FOREIGN KEY(professional_id,agreement_id,student_link_id) REFERENCES finance_agreements(professional_id,id,student_link_id),
 CHECK(paid_cents BETWEEN 0 AND amount_cents),CHECK(refunded_cents BETWEEN 0 AND paid_cents),CHECK(disputed_cents BETWEEN 0 AND paid_cents),
 CHECK(fee_cents IS NULL OR fee_cents>=0),CHECK((paid_cents=0 AND paid_on IS NULL) OR (paid_cents>0 AND paid_on IS NOT NULL))
);
CREATE INDEX finance_charges_period ON finance_charges(professional_id,due_on,id);
CREATE INDEX finance_agreements_student ON finance_agreements(professional_id,student_link_id,id);
CREATE TABLE finance_external_receipts (
 id uuid PRIMARY KEY,professional_id uuid NOT NULL,charge_id uuid NOT NULL,amount_cents integer NOT NULL CHECK(amount_cents BETWEEN 1 AND 1000000000),
 paid_on date NOT NULL,method text NOT NULL CHECK(method IN('pix','bank','cash','other')),reference varchar(120) NOT NULL DEFAULT '',note varchar(500) NOT NULL DEFAULT '',
 checked boolean NOT NULL DEFAULT false,actor_id uuid NOT NULL REFERENCES users(id),replaces_id uuid,voided_at timestamptz,void_reason varchar(500),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(professional_id,id),UNIQUE(professional_id,replaces_id),
 FOREIGN KEY(professional_id,charge_id) REFERENCES finance_charges(professional_id,id),
 FOREIGN KEY(professional_id,replaces_id) REFERENCES finance_external_receipts(professional_id,id),CHECK(actor_id=professional_id),CHECK((voided_at IS NULL)=(void_reason IS NULL))
);
CREATE INDEX finance_receipts_charge ON finance_external_receipts(professional_id,charge_id,created_at,id);
CREATE TABLE finance_operations (
 professional_id uuid NOT NULL REFERENCES finance_accounts(professional_id),operation_key uuid NOT NULL,digest text NOT NULL,kind text NOT NULL,request jsonb NOT NULL,
 target_id uuid,authorized boolean NOT NULL DEFAULT false,state text NOT NULL DEFAULT 'pending' CHECK(state IN('pending','done')),result jsonb,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(professional_id,operation_key),CHECK((state='done')=(result IS NOT NULL))
);
CREATE TABLE finance_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,professional_id uuid NOT NULL REFERENCES finance_accounts(professional_id),charge_id uuid,agreement_id uuid,
 kind text NOT NULL,detail jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(professional_id,charge_id) REFERENCES finance_charges(professional_id,id),FOREIGN KEY(professional_id,agreement_id) REFERENCES finance_agreements(professional_id,id)
);
CREATE INDEX finance_events_owner ON finance_events(professional_id,id DESC);
CREATE TABLE finance_webhooks (
 event_id text PRIMARY KEY,professional_id uuid NOT NULL REFERENCES finance_accounts(professional_id),account_id text NOT NULL,type text NOT NULL,object_id text NOT NULL,
 state text NOT NULL DEFAULT 'pending' CHECK(state IN('pending','done')),attempts integer NOT NULL DEFAULT 0,received_at timestamptz NOT NULL DEFAULT clock_timestamp(),processed_at timestamptz
);
CREATE INDEX finance_webhooks_retry ON finance_webhooks(professional_id,state,received_at);
CREATE TABLE finance_payouts (
 professional_id uuid NOT NULL REFERENCES finance_accounts(professional_id),provider_id text NOT NULL,amount_cents integer NOT NULL CHECK(amount_cents>=0),currency text NOT NULL CHECK(currency='brl'),
 state text NOT NULL CHECK(state IN('pending','in_transit','paid','failed','canceled')),arrival_on date NOT NULL,synced_at timestamptz NOT NULL DEFAULT clock_timestamp(),PRIMARY KEY(professional_id,provider_id)
);
CREATE FUNCTION finance_immutable_fields() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF TG_TABLE_NAME='finance_external_receipts' THEN
  IF (to_jsonb(NEW)-'voided_at'-'void_reason') IS DISTINCT FROM (to_jsonb(OLD)-'voided_at'-'void_reason') OR OLD.voided_at IS NOT NULL THEN RAISE EXCEPTION 'IMMUTABLE_FINANCIAL_RECEIPT'; END IF;
 ELSE
  IF (to_jsonb(NEW)-'state'-'provider_ref'-'paid_cents'-'refunded_cents'-'disputed_cents'-'fee_cents'-'net_cents'-'available_on'-'paid_on'-'version'-'discrepancy'-'synced_at') IS DISTINCT FROM (to_jsonb(OLD)-'state'-'provider_ref'-'paid_cents'-'refunded_cents'-'disputed_cents'-'fee_cents'-'net_cents'-'available_on'-'paid_on'-'version'-'discrepancy'-'synced_at') THEN RAISE EXCEPTION 'IMMUTABLE_FINANCIAL_AMOUNT'; END IF;
 END IF;RETURN NEW;END $$;
CREATE TRIGGER finance_charge_immutable BEFORE UPDATE ON finance_charges FOR EACH ROW EXECUTE FUNCTION finance_immutable_fields();
CREATE TRIGGER finance_receipt_immutable BEFORE UPDATE ON finance_external_receipts FOR EACH ROW EXECUTE FUNCTION finance_immutable_fields();
