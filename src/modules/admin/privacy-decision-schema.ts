import {z} from 'zod'
export const privacyDecisionInput=z.object({expectedState:z.enum(['pending','processing']),state:z.enum(['processing','completed','denied']),justification:z.string().trim().min(10).max(1000).refine(v=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v)),reference:z.string().trim().regex(/^[A-Za-z0-9._/-]{3,120}$/),fulfilled:z.boolean().default(false)}).strict()
