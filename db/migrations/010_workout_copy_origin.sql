-- Do not infer a historical source revision for any pre-existing copy.
ALTER TABLE workout_plans ADD COLUMN copied_from_version integer CHECK(copied_from_version>0);
ALTER TABLE workout_plans ADD CONSTRAINT workout_copy_revision FOREIGN KEY(owner_id,copied_from_id,copied_from_version) REFERENCES workout_versions(owner_id,plan_id,version);
