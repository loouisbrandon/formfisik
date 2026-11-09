'use client'
import {useRouter} from 'next/navigation'
import {Review} from '@/modules/exercises/area'
import type {ExerciseRequest} from '@/modules/exercises/schema'
export function AdminExerciseReview({request}:{request:ExerciseRequest}){const router=useRouter();return request.own?<p className="mt-4 text-sm text-muted-foreground">Outra pessoa deve revisar sua solicitação.</p>:<div className="mt-5 border-t border-border pt-5"><Review request={request} onDone={()=>{const url=new URL(window.location.href);url.searchParams.set('state','all');router.replace(url.pathname+url.search);router.refresh()}}/></div>}
