import {randomUUID} from 'node:crypto'
import type {Pool} from 'pg'
import {execute} from '../src/server/finance/service'
import {runtimeGateway} from '../src/server/finance/provider'
/** Explicit operator command; no scheduler, no bulk mutation, no external activation yet. */
async function main(){const gateway=runtimeGateway();const owner=process.argv[2],id=process.argv[3];if(!owner||!id)throw Error('EXPLICIT_OWNER_AND_CHARGE_REQUIRED');await execute(owner,{action:'reconcile',operationKey:randomUUID(),id},gateway);console.info('professional_finance_reconciled')}
main().catch(()=>{console.error('professional_finance_reconciliation_unavailable');process.exitCode=1}).finally(async()=>{await (globalThis as {formfisikPool?:Pool}).formfisikPool?.end()})
