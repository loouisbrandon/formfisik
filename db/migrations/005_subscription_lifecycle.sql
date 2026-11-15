ALTER TABLE billing_accounts ADD COLUMN sync_state text NOT NULL DEFAULT 'pending' CHECK(sync_state IN ('pending','ok','error'));
ALTER TABLE billing_accounts ADD COLUMN last_sync_attempt_at timestamptz;
ALTER TABLE billing_subscriptions
  ADD COLUMN started_at timestamptz,
  ADD COLUMN period_start timestamptz,
  ADD COLUMN period_end timestamptz,
  ADD COLUMN cancel_at_period_end boolean NOT NULL DEFAULT false,
  ADD COLUMN cancel_at timestamptz,
  ADD COLUMN canceled_at timestamptz,
  ADD COLUMN ended_at timestamptz,
  ADD COLUMN collection_paused boolean NOT NULL DEFAULT false,
  ADD COLUMN latest_invoice_id text,
  ADD COLUMN paid_through timestamptz,
  ADD COLUMN upcoming_amount integer;
CREATE TABLE billing_invoices (
  stripe_invoice_id text PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES billing_accounts(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL,
  status text NOT NULL,
  currency text NOT NULL CHECK(currency='brl'),
  amount_due integer NOT NULL,
  amount_paid integer NOT NULL,
  attempt_count integer NOT NULL,
  payment_issue text CHECK(payment_issue IN ('failed','action_required')),
  next_payment_attempt timestamptz,
  created_at timestamptz NOT NULL,
  verified_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX billing_invoice_account ON billing_invoices(account_id,created_at DESC);
CREATE TABLE billing_cancellations (
  account_id uuid PRIMARY KEY REFERENCES billing_accounts(id) ON DELETE CASCADE,
  id uuid NOT NULL UNIQUE,
  stripe_subscription_id text NOT NULL,
  target_at timestamptz NOT NULL,
  state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','confirmed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz
);
-- Existing snapshots require a fresh canonical sync before commercial authorization.
UPDATE billing_subscriptions SET verified_at='epoch';
