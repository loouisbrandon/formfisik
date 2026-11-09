-- psql -v runtime_role=REVIEWED_ROLE -f ... ; operator only, after migration.
-- The role must already exist, be dedicated, and NOT own tables/schema/database.
-- Does not create credentials, grant operator privileges, or provision a service.
BEGIN;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO :"runtime_role";
GRANT SELECT ON schema_migrations,users TO :"runtime_role";
GRANT INSERT(id,email,full_name,email_verified_at) ON users TO :"runtime_role";
-- PostgreSQL row locks (session issuance) require UPDATE on at least one column.
GRANT UPDATE(full_name) ON users TO :"runtime_role";
GRANT SELECT,INSERT,UPDATE ON credentials TO :"runtime_role";
GRANT SELECT,INSERT,UPDATE,DELETE ON pending_registrations,sessions,password_resets,abuse_limits,workout_documents,document_photo_authorizations,document_photo_references TO :"runtime_role";
GRANT SELECT,INSERT,UPDATE ON billing_accounts,billing_checkouts,billing_subscriptions,billing_events,billing_invoices,billing_cancellations,
 student_records,student_links,student_administrative_events,
 exercise_entries,exercise_versions,exercise_events,exercise_requests,exercise_request_events,exercise_creation_keys,
 workout_plans,workout_versions,workout_exercise_references,workout_operation_keys,
 professional_presentations,physical_assessments,physical_assessment_events,
 photo_authorizations,photo_records,progress_photo_images,photo_record_events,photo_removal_operations TO :"runtime_role";
GRANT SELECT,INSERT,UPDATE ON intake_forms,intake_requests TO :"runtime_role";
GRANT SELECT,INSERT ON intake_versions,intake_submissions,intake_events TO :"runtime_role";
GRANT USAGE ON SEQUENCE intake_events_id_seq TO :"runtime_role";
GRANT SELECT,INSERT,UPDATE ON crm_stages,crm_settings,crm_memberships,crm_tasks,crm_operations TO :"runtime_role";
GRANT SELECT,INSERT ON crm_events TO :"runtime_role";
GRANT USAGE ON SEQUENCE crm_events_id_seq TO :"runtime_role";
GRANT SELECT ON exercise_datasets,exercise_moderators,exercise_moderator_events TO :"runtime_role";
GRANT USAGE ON SEQUENCE student_administrative_events_id_seq,exercise_events_id_seq TO :"runtime_role";

-- 019 administrative services. Immutable agreements/events; privacy worker uses separate role.
GRANT SELECT,INSERT,UPDATE ON professional_services,professional_service_plans,professional_contracts,professional_deliveries,professional_commercial_operations TO :"runtime_role";
GRANT DELETE ON professional_deliveries TO :"runtime_role"; -- replace obligations of an untouched draft only, checked in repository
GRANT SELECT,INSERT ON professional_plan_versions,professional_contract_versions,professional_delivery_executions,professional_commercial_events TO :"runtime_role";
GRANT UPDATE(voided_at,void_reason) ON professional_delivery_executions TO :"runtime_role";
GRANT USAGE ON SEQUENCE professional_commercial_events_id_seq TO :"runtime_role";

-- 020: financial histories are retained; runtime has no deletion privilege.
GRANT SELECT,INSERT,UPDATE ON finance_accounts,finance_agreements,finance_charges,finance_operations,finance_webhooks,finance_payouts TO :"runtime_role";
GRANT SELECT,INSERT ON finance_external_receipts,finance_events TO :"runtime_role";
GRANT UPDATE(voided_at,void_reason) ON finance_external_receipts TO :"runtime_role";
GRANT USAGE ON SEQUENCE finance_events_id_seq TO :"runtime_role";

-- 021: agenda histories append-only; privacy uses the separate operator role.
GRANT SELECT,INSERT,UPDATE ON agenda_settings,agenda_exceptions,agenda_session_types,agenda_series,agenda_occurrences,agenda_operations TO :"runtime_role";
GRANT DELETE ON agenda_exceptions TO :"runtime_role";
GRANT SELECT,INSERT ON agenda_fulfillments,agenda_events TO :"runtime_role";
GRANT UPDATE(released_at) ON agenda_fulfillments TO :"runtime_role";
GRANT USAGE ON SEQUENCE agenda_events_id_seq TO :"runtime_role";

-- 023: content metadata/references append-only; processing state updated by provider reconciliation.
GRANT SELECT,INSERT,UPDATE ON exercise_videos,exercise_video_sets TO :"runtime_role";
GRANT SELECT,INSERT ON exercise_video_versions,exercise_video_set_versions,exercise_video_set_items,workout_video_references,media_operations,media_events TO :"runtime_role";
GRANT UPDATE(external_id,upload_expires_at,processing,seconds) ON exercise_video_versions TO :"runtime_role";
GRANT SELECT ON media_publishers TO :"runtime_role";
GRANT SELECT,INSERT ON media_cleanup TO :"runtime_role";
GRANT USAGE ON SEQUENCE media_events_id_seq TO :"runtime_role";

GRANT UPDATE(result) ON media_operations TO :"runtime_role"; -- webhook lease/result only

-- Marco022: submissions/reviews/events append-only; privacy operator is separate.
GRANT SELECT,INSERT,UPDATE ON checkin_assignments,checkin_occurrences,checkin_invitations,checkin_operations TO :"runtime_role";
GRANT SELECT,INSERT ON checkin_submissions,checkin_reviews,checkin_events TO :"runtime_role";
GRANT USAGE ON SEQUENCE checkin_events_id_seq TO :"runtime_role";

-- Communication024: immutable records/versions, receipts and audit; operator-only erasure.
GRANT SELECT,INSERT,UPDATE ON communication_templates,communication_operations TO :"runtime_role";
GRANT SELECT,INSERT ON communication_template_versions,communication_records,communication_reads,communication_events TO :"runtime_role";
GRANT USAGE ON SEQUENCE communication_events_id_seq TO :"runtime_role";

-- Marco026: no runtime DELETE of jobs, rows or audit; temporary inputs can only be cleared.
GRANT SELECT,INSERT ON professional_imports,professional_import_rows,professional_import_events TO :"runtime_role";
GRANT UPDATE(state,version,approval_digest,request_digest) ON professional_imports TO :"runtime_role";
GRANT UPDATE(state,decision,input,error_code,result_id,student_link_id) ON professional_import_rows TO :"runtime_role";
GRANT USAGE ON SEQUENCE professional_import_events_id_seq TO :"runtime_role";

-- 027: account/profile settings; privacy resolution remains operator-only.
GRANT SELECT,INSERT,UPDATE ON professional_settings TO :"runtime_role";
GRANT SELECT,INSERT ON settings_privacy_requests,settings_events TO :"runtime_role";
GRANT UPDATE(user_id) ON settings_privacy_requests TO :"runtime_role"; -- idempotent request only
GRANT SELECT,INSERT,DELETE ON settings_email_changes TO :"runtime_role";
GRANT UPDATE(email,email_verified_at) ON users TO :"runtime_role";
GRANT USAGE ON SEQUENCE settings_events_id_seq TO :"runtime_role";
-- 029: self-service closure; operator alone processes erasure.
GRANT SELECT,INSERT ON account_closures TO :"runtime_role";
GRANT UPDATE(disabled_at) ON users TO :"runtime_role";
-- 031/034: server-admin audited grant management; no DELETE or audit mutation.
GRANT SELECT ON complimentary_access_grants TO :"runtime_role";
-- Administrative privacy monitoring: metadata only; processing stays operator-only.
GRANT SELECT(id,owner_id,scope,state,blocker,created_at,completed_at,not_before) ON privacy_erasure_jobs TO :"runtime_role";
GRANT SELECT(id,user_id,kind,reason,occurred_at) ON account_security_events TO :"runtime_role";
GRANT SELECT(actor_id) ON account_security_events TO :"runtime_role";
GRANT INSERT(user_id,kind,reason,actor_id) ON account_security_events TO :"runtime_role";
GRANT USAGE ON SEQUENCE account_security_events_id_seq TO :"runtime_role";
GRANT SELECT(owner_id,state) ON privacy_erasure_jobs TO :"runtime_role";
GRANT SELECT,INSERT ON admin_privacy_decisions TO :"runtime_role";
GRANT USAGE ON SEQUENCE admin_privacy_decisions_id_seq TO :"runtime_role";
GRANT UPDATE(status,resolution_reference,resolved_at) ON settings_privacy_requests TO :"runtime_role";
GRANT INSERT ON complimentary_access_grants TO :"runtime_role";
GRANT UPDATE(revoked_at) ON complimentary_access_grants TO :"runtime_role";
GRANT SELECT,INSERT ON complimentary_access_events TO :"runtime_role";
GRANT USAGE ON SEQUENCE complimentary_access_events_id_seq TO :"runtime_role";
COMMIT;
