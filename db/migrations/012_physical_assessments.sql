-- Individual physical measurements, never shared across professionals.
CREATE TABLE physical_assessments (
 id uuid PRIMARY KEY,
 professional_id uuid NOT NULL REFERENCES users(id),
 student_link_id uuid NOT NULL,
 author_id uuid NOT NULL REFERENCES users(id),
 assessment_date date NOT NULL CHECK(assessment_date>='1900-01-01'),
 "weight" numeric(5,2) CHECK("weight">0 AND "weight"<=500),
 "neck" numeric(5,2) CHECK("neck">0 AND "neck"<=400),
 "shoulders" numeric(5,2) CHECK("shoulders">0 AND "shoulders"<=400),
 "chest" numeric(5,2) CHECK("chest">0 AND "chest"<=400),
 "waist" numeric(5,2) CHECK("waist">0 AND "waist"<=400),
 "abdomen" numeric(5,2) CHECK("abdomen">0 AND "abdomen"<=400),
 "hips" numeric(5,2) CHECK("hips">0 AND "hips"<=400),
 "rightArm" numeric(5,2) CHECK("rightArm">0 AND "rightArm"<=400),
 "leftArm" numeric(5,2) CHECK("leftArm">0 AND "leftArm"<=400),
 "rightForearm" numeric(5,2) CHECK("rightForearm">0 AND "rightForearm"<=400),
 "leftForearm" numeric(5,2) CHECK("leftForearm">0 AND "leftForearm"<=400),
 "rightThigh" numeric(5,2) CHECK("rightThigh">0 AND "rightThigh"<=400),
 "leftThigh" numeric(5,2) CHECK("leftThigh">0 AND "leftThigh"<=400),
 "rightCalf" numeric(5,2) CHECK("rightCalf">0 AND "rightCalf"<=400),
 "leftCalf" numeric(5,2) CHECK("leftCalf">0 AND "leftCalf"<=400),
 notes varchar(3000) NOT NULL DEFAULT '',
 state text NOT NULL DEFAULT 'active' CHECK(state IN ('active','archived')),
 version integer NOT NULL DEFAULT 1 CHECK(version>0),
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 creation_key uuid NOT NULL,creation_digest text NOT NULL,
 UNIQUE(professional_id,creation_key),UNIQUE(professional_id,id),
 FOREIGN KEY(professional_id,student_link_id) REFERENCES student_links(professional_id,id),
 CHECK(author_id=professional_id)
);
CREATE INDEX physical_assessments_chronology ON physical_assessments(professional_id,student_link_id,state,assessment_date,created_at,id);
CREATE TABLE physical_assessment_events (
 assessment_id uuid NOT NULL,professional_id uuid NOT NULL,
 version integer NOT NULL CHECK(version>0),actor_id uuid NOT NULL REFERENCES users(id),
 kind text NOT NULL CHECK(kind IN ('created','edited','archived','reactivated')),
 occurred_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(assessment_id,version),
 FOREIGN KEY(professional_id,assessment_id) REFERENCES physical_assessments(professional_id,id),
 CHECK(actor_id=professional_id)
);
-- Administrative audit deliberately excludes historical health payloads.
