import 'server-only'
import type {PoolClient} from 'pg'
import type {WorkoutFields} from '@/modules/workouts/schema'
import {MediaError} from './repository'
/** New references must belong to the exercise's current authorized association.
 * Existing references can survive archival/removal; revocation still prevents playback. */
export async function validateWorkoutVideos(c:PoolClient,owner:string,fields:WorkoutFields,previous?:WorkoutFields){
 const prior=new Set(previous?.divisions.flatMap(d=>d.exercises.flatMap(e=>(e.demos??[]).map(v=>`${e.id}:${e.exerciseId}:${v.videoId}:${v.revision}`)))??[])
 for(const division of fields.divisions)for(const e of division.exercises)for(const v of e.demos??[]){if(prior.has(`${e.id}:${e.exerciseId}:${v.videoId}:${v.revision}`))continue;const r=await c.query(`SELECT 1 FROM exercise_video_sets s JOIN exercise_video_set_items i ON i.set_id=s.id AND i.version=s.version JOIN exercise_videos v ON v.id=i.video_id JOIN exercise_video_versions r ON r.video_id=v.id AND r.revision=i.video_revision WHERE s.exercise_id=$2 AND(s.scope='official' OR s.owner_id=$1) AND i.video_id=$3 AND i.video_revision=$4 AND v.state='active' AND r.processing='ready' AND(v.scope='official' OR v.owner_id=$1) FOR SHARE OF s,v,r`,[owner,e.exerciseId,v.videoId,v.revision]);if(!r.rowCount)throw new MediaError(409,'Demonstração alterada, não associada ao exercício ou sem autorização.')}
}
export async function snapshotWorkoutVideos(c:PoolClient,owner:string,plan:string,version:number,f:WorkoutFields){for(const d of f.divisions)for(const e of d.exercises)for(const [position,v]of(e.demos??[]).entries())await c.query('INSERT INTO workout_video_references VALUES($1,$2,$3,$4,$5,$6,$7)',[owner,plan,version,e.id,position,v.videoId,v.revision])}
