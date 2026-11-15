/** Operational release control, not user authorization. Missing/unknown values keep production closed. */
export function releaseClosed(environment=process.env.RAILWAY_ENVIRONMENT_NAME,state=process.env.PRODUCTION_RELEASE_STATE){
 return environment==='production'&&state!=='open'
}
