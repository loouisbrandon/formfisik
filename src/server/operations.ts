import 'server-only'
import {schemaReady} from './schema-readiness'
import {db} from './db'
import {billingConfigured} from './subscriptions/stripe'
import {r2PhotoStore} from './progress-photos/storage'
import {mailConfig} from './config'
/** Operator-only: no env values, subject IDs, object keys, URLs or provider payloads. */
export async function operationalStatus(){
 const ready=await schemaReady()
 const role=await db().query(`SELECT rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls,
  has_schema_privilege(current_user,'public','CREATE') AS schema_create,
  has_database_privilege(current_user,current_database(),'CREATE') AS database_create,
  EXISTS(SELECT 1 FROM pg_database WHERE datname=current_database() AND datdba=(SELECT oid FROM pg_roles WHERE rolname=current_user)) AS owns_database,
  EXISTS(SELECT 1 FROM pg_namespace WHERE nspname='public' AND nspowner=(SELECT oid FROM pg_roles WHERE rolname=current_user)) AS owns_schema,
  EXISTS(SELECT 1 FROM pg_tables WHERE schemaname='public' AND tableowner=current_user) AS owns_tables FROM pg_roles WHERE rolname=current_user`)
 const unsafe=Object.values(role.rows[0]).some(Boolean)
 let smtp=false;try{mailConfig();smtp=true}catch{}
 if(!ready)return {schema:'unavailable',connectionBasicPrivilegeChecksPass:!unsafe,integrations:{stripeConfiguration:billingConfigured(),r2Configuration:!!r2PhotoStore(),smtpConfiguration:smtp},externalHomologation:false,queues:null}
 const q=await db().query(`SELECT
 (SELECT count(*)::int FROM pending_registrations WHERE expires_at<=clock_timestamp()) AS expired_registrations,
 (SELECT count(*)::int FROM password_resets WHERE expires_at<=clock_timestamp()) AS expired_resets,
 (SELECT count(*)::int FROM workout_documents WHERE expires_at<=clock_timestamp()) AS expired_documents,
 (SELECT count(*)::int FROM progress_photo_images WHERE cleanup_due_at<=clock_timestamp()) AS photo_cleanup_due,
 (SELECT count(*)::int FROM privacy_erasure_jobs WHERE state<>'completed') AS erasure_pending,
 (SELECT count(*)::int FROM privacy_erasure_objects WHERE cleanup_due_at<=clock_timestamp()) AS erasure_objects_due,
 (SELECT COALESCE(max(GREATEST(0,extract(epoch FROM clock_timestamp()-cleanup_due_at))),0)::bigint FROM progress_photo_images WHERE cleanup_due_at<=clock_timestamp()) AS oldest_photo_due_seconds,
 (SELECT COALESCE(max(GREATEST(0,extract(epoch FROM clock_timestamp()-created_at))),0)::bigint FROM privacy_erasure_jobs WHERE state<>'completed') AS oldest_erasure_pending_seconds,
 (SELECT count(*)::int FROM billing_accounts WHERE stripe_customer_id IS NOT NULL AND (sync_state<>'ok' OR last_sync_attempt_at IS NULL OR last_sync_attempt_at<clock_timestamp()-interval '5 minutes')) AS billing_sync_due`)
 return {schema:'ready',connectionBasicPrivilegeChecksPass:!unsafe,integrations:{stripeConfiguration:billingConfigured(),r2Configuration:!!r2PhotoStore(),smtpConfiguration:smtp},externalHomologation:false,queues:q.rows[0]}
}
