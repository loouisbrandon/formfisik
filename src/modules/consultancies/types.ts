import type {ServiceFields,PlanFields,ContractFields} from './schema'
export type CatalogItem={id:string;name:string;version:number;archived:boolean;category?:ServiceFields['category'];channel?:ServiceFields['channel'];service_id?:string;service_name?:string;price_cents?:number;available?:boolean;service_archived?:boolean;duration?:number;unit?:PlanFields['unit']}
export type ServiceDetail={id:string;fields:ServiceFields;version:number;archived:boolean}
export type PlanDetail={id:string;fields:PlanFields;service_name:string;version:number;archived:boolean;versions:{items:{version:number;created_at:string}[];total:number;page:number}}
export type Agreement=PlanFields&{serviceSnapshot:ServiceFields;serviceVersion:number}
export type ContractRow={id:string;student_link_id:string;service_id:string;plan_id:string;plan_version:number;version:number;price_cents:number;sessions:number|null;currency:'brl';previous_id:string|null;administrative_state:'draft'|'active'|'suspended'|'completed'|'canceled';state:'draft'|'active'|'scheduled'|'suspended'|'completed'|'canceled'|'expired';start:string;finish:string;name:string;service_name:string;full_name:string;near:boolean;pending:number;overdue:number}
export type ContractDetail=ContractRow&{next_id:string|null;agreement:Agreement;administrative_notes:string;versions:{items:{version:number;price_cents:number;state:ContractRow['administrative_state'];created_at:string}[];page:number;total:number}}
export type DeliveryRow={id:string;name:string;contract_id:string;student_link_id:string;type:keyof typeof import('./schema').deliveryTypes;quantity:number;executed:number;required:boolean;state:'pending'|'in_progress'|'completed'|'canceled';version:number;due:string;full_name:string;contract_name:string;contract_state:ContractRow['state'];overdue:boolean}
export type Execution={id:string;units:number;evidence_type:'workout'|'assessment'|'intake'|null;evidence_id:string|null;evidence_version:number|null;evidence_date:string|null;evidence_current:boolean|null;note:string;occurred_at:string;voided_at:string|null;void_reason:string|null}
export type DeliveryDetail=DeliveryRow&{definition:import('./schema').IncludedDelivery;executions:{items:Execution[];total:number;page:number}}
export type Page<T>={items:T[];total:number;page:number;pageSize:number}
export type ContractDraft={id?:string;version?:number;previousId?:string;previousVersion?:number;fields:ContractFields}

export type AgreementRevision={version:number;document:{agreement:Agreement;priceCents:number;start:string;end:string;state:ContractRow['administrative_state'];administrativeNotes:string}}
