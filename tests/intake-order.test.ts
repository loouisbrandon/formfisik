import {test} from 'node:test'
import assert from 'node:assert/strict'
import {reorderQuestion} from '../src/modules/intake/question-order'
import {formSchema,type FormDefinition} from '../src/modules/intake/schema'
const id=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`
const fixture=():FormDefinition=>({title:'Ordem sintética',description:'',sections:[{id:id(10),title:'Seção',questions:Array.from({length:5},(_,i)=>({id:id(i),title:`Pergunta ${i+1}`,description:'',type:'short',required:false,options:[],min:null,max:null,condition:null}))}]})
test('move primeira ao final e última ao início sem mutar nem perder identidades',()=>{
 const form=fixture(),before=structuredClone(form),next=reorderQuestion(form,0,0,4)!
 assert.deepEqual(next.sections[0].questions.map(q=>q.id),[id(1),id(2),id(3),id(4),id(0)])
 assert.equal(next.sections[0].questions[4],form.sections[0].questions[0]);assert.deepEqual(form,before)
 assert.deepEqual(reorderQuestion(next,0,4,0),form);assert.equal(formSchema.safeParse(next).success,true)
})
test('limites inválidos e movimento vazio',()=>{const f=fixture();for(const [s,a,b] of [[-1,0,1],[0,-1,1],[0,0,5],[0,1.5,2]])assert.equal(reorderQuestion(f,s,a,b),null);assert.equal(reorderQuestion(f,0,1,1),f)})
test('condições não podem apontar para pergunta posterior; metadados e outras seções preservados',()=>{
 const f=fixture();f.sections[0].questions[0].type='boolean';f.sections[0].questions[2].condition={questionId:id(0),equals:'yes'}
 f.sections.push({id:id(11),title:'Outra seção',questions:[{...f.sections[0].questions[4],id:id(20)}]})
 assert.equal(reorderQuestion(f,0,0,4),null);assert.equal(reorderQuestion(f,0,2,0),null)
 const next=reorderQuestion(f,0,2,4)!;assert.equal(next.sections[1],f.sections[1]);assert.deepEqual(next.sections[0].questions[4].condition,f.sections[0].questions[2].condition)
 assert.equal(formSchema.safeParse(next).success,true)
})
