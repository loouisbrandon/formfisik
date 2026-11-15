import {join} from 'node:path'
/** New runs never overwrite versioned historical evidence by default. */
export const artifactPath=(path:string)=>join(process.env.TEST_ARTIFACT_ROOT||'test-results/current',path)
