import {z} from 'zod'
const justification=z.string().trim().min(10).max(1000).refine(v=>!/[\u0000-\u001f\u007f]/.test(v))
export const complimentaryInput=z.discriminatedUnion('operation',[
 z.object({operation:z.literal('grant'),userId:z.uuid(),expiresAt:z.iso.datetime({offset:true}).nullable(),justification}).strict(),
 z.object({operation:z.literal('revoke'),userId:z.uuid(),grantId:z.uuid(),justification}).strict(),
])
