-- Existing subscriptions/checkouts retain their Pro monthly terms.
ALTER TABLE billing_checkouts ADD COLUMN plan_id text NOT NULL DEFAULT 'pro' CHECK(plan_id IN ('standard','premium','pro'));
ALTER TABLE billing_checkouts ADD COLUMN billing_interval text NOT NULL DEFAULT 'month' CHECK(billing_interval IN ('month','year'));
ALTER TABLE billing_checkouts ADD COLUMN amount integer NOT NULL DEFAULT 13990;
ALTER TABLE billing_checkouts ADD CONSTRAINT billing_checkout_catalog_amount CHECK(amount=CASE plan_id WHEN 'standard' THEN CASE billing_interval WHEN 'month' THEN 4990 ELSE 47904 END WHEN 'premium' THEN CASE billing_interval WHEN 'month' THEN 8990 ELSE 86304 END ELSE CASE billing_interval WHEN 'month' THEN 13990 ELSE 134304 END END);
ALTER TABLE billing_subscriptions ADD COLUMN plan_id text NOT NULL DEFAULT 'pro' CHECK(plan_id IN ('standard','premium','pro'));
ALTER TABLE billing_subscriptions ADD COLUMN billing_interval text NOT NULL DEFAULT 'month' CHECK(billing_interval IN ('month','year'));
ALTER TABLE billing_subscriptions ADD COLUMN amount integer NOT NULL DEFAULT 13990;
ALTER TABLE billing_subscriptions DROP CONSTRAINT billing_subscriptions_monthly_amount_check;
ALTER TABLE billing_subscriptions ADD CONSTRAINT billing_subscription_catalog_amount CHECK(monthly_amount=CASE plan_id WHEN 'standard' THEN 4990 WHEN 'premium' THEN 8990 ELSE 13990 END AND amount=CASE plan_id WHEN 'standard' THEN CASE billing_interval WHEN 'month' THEN 4990 ELSE 47904 END WHEN 'premium' THEN CASE billing_interval WHEN 'month' THEN 8990 ELSE 86304 END ELSE CASE billing_interval WHEN 'month' THEN 13990 ELSE 134304 END END);
