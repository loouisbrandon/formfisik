import {z} from 'zod'
// Zod's optional JIT probes Function(), which correctly violates strict CSP.
// Use its maintained interpreter; validation rules and results are unchanged.
z.config({jitless:true})
export {z}
