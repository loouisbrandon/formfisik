-- CRM operation: extend the existing task entity; no alternate scheduling model.
ALTER TABLE crm_tasks ALTER COLUMN student_link_id DROP NOT NULL;
ALTER TABLE crm_tasks DROP CONSTRAINT crm_tasks_status_check;
ALTER TABLE crm_tasks ADD CONSTRAINT crm_tasks_status_check CHECK(status IN ('pending','in_progress','waiting','completed','canceled'));
ALTER TABLE crm_tasks ADD COLUMN appointment_id uuid;
ALTER TABLE crm_tasks ADD CONSTRAINT crm_tasks_appointment_fk FOREIGN KEY(professional_id,appointment_id) REFERENCES agenda_occurrences(professional_id,id) ON DELETE SET NULL (appointment_id);
CREATE INDEX crm_tasks_appointment ON crm_tasks(professional_id,appointment_id) WHERE appointment_id IS NOT NULL;
