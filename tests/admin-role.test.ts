import {test} from 'node:test'
import assert from 'node:assert/strict'
import {registrationSchema} from '../src/modules/registration/schema'
const fields={fullName:'Administrador sintético',email:'admin-fixture@example.test',password:'FormFisik!Teste2026',confirmPassword:'FormFisik!Teste2026'}
test('public registration rejects admin self-assignment',()=>{
 assert.equal(registrationSchema.safeParse(fields).success,true)
 assert.equal(registrationSchema.safeParse({...fields,role:'admin'}).success,false)
 assert.equal(registrationSchema.safeParse({...fields,isAdmin:true}).success,false)
 assert.equal(registrationSchema.safeParse({...fields,permissions:['*']}).success,false)
})
