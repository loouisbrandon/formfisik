import {z} from 'zod'
const text=(n:number)=>z.string().trim().normalize('NFC').max(n).refine(v=>!/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(v),'Remova caracteres de controle.')
export const presentationFields=z.object({professionalName:text(160),brand:text(160),registration:text(100),contact:text(200)}).strict()
export const savePresentation=presentationFields.extend({revision:z.int().nonnegative(),logo:z.string().max(349528).regex(/^[A-Za-z0-9+/]*={0,2}$/).nullable().optional()}).strict()
export type Presentation=z.infer<typeof presentationFields>&{revision:number;hasLogo:boolean}
export const exportOptions=z.object({version:z.int().positive(),layout:z.enum(['compact','premium']),divisionIds:z.array(z.uuid()).max(30).nullable(),loads:z.boolean(),notes:z.boolean(),guidance:z.boolean(),annotations:z.boolean(),professional:z.boolean(),brand:z.boolean()}).strict().refine(v=>!v.divisionIds||v.divisionIds.length===new Set(v.divisionIds).size,'Divisões repetidas.')
export type ExportOptions=z.infer<typeof exportOptions>
export const defaultOptions:Omit<ExportOptions,'version'>={layout:'compact',divisionIds:null,loads:true,notes:true,guidance:true,annotations:false,professional:true,brand:true}
export const emptyPresentation:Presentation={professionalName:'',brand:'',registration:'',contact:'',revision:0,hasLogo:false}
