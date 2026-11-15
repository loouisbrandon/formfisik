-- Private authoring only. No checkout, buyer entitlement, inventory or SaaS plan changes.
CREATE TABLE professional_products (
 id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 version integer NOT NULL DEFAULT 1 CHECK(version>0), state text NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','ready','archived')),
 name varchar(160) NOT NULL, name_key text NOT NULL,
 kind text NOT NULL CHECK(kind IN ('digital','physical')), format text NOT NULL CHECK(format IN ('ebook','course','workout','program','physical')),
 document jsonb NOT NULL CHECK(octet_length(document::text)<=524288),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(owner_id,id), CHECK((kind='physical')=(format='physical'))
);
CREATE INDEX product_owner_list ON professional_products(owner_id,updated_at DESC,id);
CREATE TABLE professional_product_files (
 id uuid PRIMARY KEY, owner_id uuid NOT NULL, product_id uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN ('cover','pdf')), name varchar(160) NOT NULL,
 mime text NOT NULL CHECK(mime IN ('image/jpeg','application/pdf')),
 content bytea NOT NULL CHECK(octet_length(content) BETWEEN 1 AND 8388608),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(owner_id,product_id,id),
 FOREIGN KEY(owner_id,product_id) REFERENCES professional_products(owner_id,id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX product_one_cover ON professional_product_files(product_id) WHERE kind='cover';
CREATE TABLE professional_product_workouts (
 owner_id uuid NOT NULL, product_id uuid NOT NULL, plan_id uuid NOT NULL, plan_version integer NOT NULL,
 snapshot jsonb NOT NULL, attached_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(product_id,plan_id), FOREIGN KEY(owner_id,product_id) REFERENCES professional_products(owner_id,id) ON DELETE CASCADE
);
CREATE TABLE professional_product_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, owner_id uuid NOT NULL, product_id uuid NOT NULL,
 version integer NOT NULL, kind text NOT NULL CHECK(kind IN ('created','saved','ready','draft','archived','file_added','file_removed','workout_added','workout_removed')),
 occurred_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(owner_id,product_id) REFERENCES professional_products(owner_id,id) ON DELETE CASCADE
);
CREATE TABLE professional_product_operations (
 owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, operation_key uuid NOT NULL,
 digest text NOT NULL, product_id uuid NOT NULL, PRIMARY KEY(owner_id,operation_key),
 FOREIGN KEY(owner_id,product_id) REFERENCES professional_products(owner_id,id) ON DELETE CASCADE
);
