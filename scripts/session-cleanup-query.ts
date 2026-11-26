// Shared by the operational CLI and isolated regression tests. No environment I/O.
export const expiredSessionsSql=`DELETE FROM sessions s WHERE revoked_at IS NOT NULL
 OR (NOT EXISTS(SELECT 1 FROM mobile_session_families m WHERE m.id=s.logical_id)
     AND (s.expires_at<now() OR s.last_seen_at<now()-interval '365 days'))
 OR EXISTS(SELECT 1 FROM mobile_session_families m WHERE m.id=s.logical_id AND m.last_relevant_at<now()-interval '365 days')`
