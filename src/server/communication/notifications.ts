import 'server-only'
// Pure projection of canonical facts. No content, external delivery or background side effects.
export const noticeSource=`
 SELECT 'checkin:'||o.id||':'||s.revision AS source_key,o.student_link_id,'checkin'::text AS context_kind,o.id AS context_id,s.revision AS context_version,
 CASE WHEN s.feedback->>'adjustmentRequested'='true' THEN 'checkin_adjustment' ELSE 'checkin_review' END AS kind,s.acknowledged_at AS source_at
 FROM checkin_occurrences o JOIN LATERAL(SELECT revision,feedback,acknowledged_at FROM checkin_submissions WHERE professional_id=o.professional_id AND occurrence_id=o.id ORDER BY revision DESC LIMIT 1)s ON true
 WHERE o.professional_id=$1 AND o.state IN('received','reviewing')
 UNION ALL
 SELECT 'agenda:'||id||':'||version||':near',student_link_id,'appointment',id,version,'appointment_near',starts_at
 FROM agenda_occurrences WHERE professional_id=$1 AND student_link_id IS NOT NULL AND state='scheduled' AND starts_at>clock_timestamp() AND starts_at<=clock_timestamp()+interval '24 hours'
 UNION ALL
 SELECT 'agenda:'||id||':'||version||':attendance',student_link_id,'appointment',id,version,'attendance_pending',ends_at
 FROM agenda_occurrences WHERE professional_id=$1 AND student_link_id IS NOT NULL AND state='scheduled' AND ends_at<clock_timestamp() AND ends_at>=clock_timestamp()-interval '7 days'
 UNION ALL
 SELECT 'contract:'||id||':'||version||':ending',student_link_id,'contract',id,version,'contract_ending',ends_on::timestamp AT TIME ZONE 'America/Sao_Paulo'
 FROM professional_contracts WHERE professional_id=$1 AND state='active' AND ends_on BETWEEN (clock_timestamp() AT TIME ZONE 'America/Sao_Paulo')::date AND (clock_timestamp() AT TIME ZONE 'America/Sao_Paulo')::date+7`
export const notificationRows=`SELECT n.source_key,n.student_link_id,n.context_kind,n.context_id,n.context_version,n.kind,n.source_at,s.full_name,r.read_at FROM (${noticeSource})n JOIN student_links l ON l.professional_id=$1 AND l.id=n.student_link_id JOIN student_records s ON s.professional_id=l.professional_id AND s.id=l.student_id LEFT JOIN communication_reads r ON r.professional_id=$1 AND r.source_key=n.source_key WHERE l.status='active' AND ($2::uuid IS NULL OR l.id=$2)`
