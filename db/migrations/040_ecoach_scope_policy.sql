-- Static scope responses are distinguishable from both model inference and demonstrations.
ALTER TABLE ecoach_turns DROP CONSTRAINT ecoach_turns_mode_check;
ALTER TABLE ecoach_turns ADD CONSTRAINT ecoach_turns_mode_check CHECK(mode IN ('demo','ai','policy'));
