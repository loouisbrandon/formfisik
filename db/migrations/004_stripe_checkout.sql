CREATE TABLE billing_accounts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  trial_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE billing_checkouts (
  id uuid PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES billing_accounts(id) ON DELETE CASCADE,
  stripe_session_id text UNIQUE,
  state text NOT NULL DEFAULT 'creating' CHECK (state IN ('creating','open','confirmed','expired')),
  price_id text NOT NULL,
  product_id text NOT NULL,
  app_origin text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  CHECK (expires_at > created_at)
);
CREATE UNIQUE INDEX billing_one_pending_checkout ON billing_checkouts(account_id) WHERE state IN ('creating','open');
CREATE TABLE billing_subscriptions (
  account_id uuid PRIMARY KEY REFERENCES billing_accounts(id) ON DELETE CASCADE,
  checkout_id uuid NOT NULL UNIQUE REFERENCES billing_checkouts(id),
  stripe_subscription_id text NOT NULL UNIQUE,
  provider_status text NOT NULL,
  trial_start timestamptz,
  trial_end timestamptz,
  price_id text NOT NULL,
  product_id text NOT NULL,
  currency text NOT NULL CHECK (currency='brl'),
  monthly_amount integer NOT NULL CHECK (monthly_amount=13990),
  verified_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE billing_events (
  stripe_event_id text PRIMARY KEY,
  event_type text NOT NULL,
  provider_created_at timestamptz NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  outcome text NOT NULL CHECK (outcome IN ('processed','ignored'))
);
