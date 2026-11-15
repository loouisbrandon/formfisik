// Component contract/browser verification only. Synthetic in-memory save; no database or credentials.
import assert from 'node:assert/strict'
import {spawn} from 'node:child_process'
import {mkdtemp,mkdir,writeFile,readFile,symlink,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {setTimeout as delay} from 'node:timers/promises'
import {chromium,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
async function main(){
 const root=process.cwd(),directory=await mkdtemp(join(tmpdir(),'formfisik-intake-order-')),out=join(root,'test-results/local/intake-order')
 await mkdir(out,{recursive:true})
 let server:ReturnType<typeof spawn>|undefined,browser,output=''
 try{
  await symlink(join(root,'node_modules'),join(directory,'node_modules'),'dir')
  await writeFile(join(directory,'package.json'),JSON.stringify({private:true}))
  await writeFile(join(directory,'tsconfig.json'),JSON.stringify({extends:join(root,'tsconfig.json'),compilerOptions:{paths:{'@/*':[join(root,'src/*')]}},include:['app/**/*.tsx','.next/**/*.ts']}))
  await writeFile(join(directory,'next.config.js'),`module.exports={devIndicators:false,outputFileTracingRoot:${JSON.stringify(root)},webpack(config){config.resolve.alias['@']=${JSON.stringify(join(root,'src'))};return config}}`)
  await writeFile(join(directory,'postcss.config.mjs'),await readFile(join(root,'postcss.config.mjs'),'utf8'))
  await mkdir(join(directory,'app'),{recursive:true})
  await writeFile(join(directory,'app/layout.tsx'),`export {default} from ${JSON.stringify(join(root,'src/app/layout'))};export const metadata={title:'Anamnese sintética | FormFisik'}`)
  await writeFile(join(directory,'app/page.tsx'),`'use client';import {useState} from 'react';import {ProfessionalShell} from ${JSON.stringify(join(root,'src/modules/professional/shell'))};import {FormBuilder} from ${JSON.stringify(join(root,'src/modules/intake/builder'))};import type {FormDefinition} from ${JSON.stringify(join(root,'src/modules/intake/schema'))};const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');const initial:FormDefinition={title:'Formulário sintético',description:'',sections:[{id:id(10),title:'Primeira seção',questions:Array.from({length:5},(_,i)=>({id:id(i),title:'Pergunta '+(i+1),description:'',type:i===0?'boolean':'short',required:false,options:[],min:null,max:null,condition:i===2?{questionId:id(0),equals:'yes'}:null}))}]};export default function Page(){const [saved,setSaved]=useState(initial),[key,setKey]=useState(0),[published,setPublished]=useState('');return <ProfessionalShell professional fullName="Profissional sintético"><div><FormBuilder key={key} initial={saved} onSave={async f=>{setSaved(f)}} onBack={()=>{}} onPublish={async f=>{setPublished(f.sections[0].questions.map(q=>q.title).join(','))}}/><button onClick={()=>setKey(key+1)}>Reabrir rascunho sintético</button><output aria-label="Versão sintética">{published}</output></div></ProfessionalShell>}`)
  server=spawn(process.execPath,[join(root,'node_modules/next/dist/bin/next'),'dev',directory,'--webpack','--port','3132'],{stdio:['ignore','pipe','pipe']});server.stdout?.on('data',c=>output+=c);server.stderr?.on('data',c=>output+=c)
  let ready=false;for(let i=0;i<90;i++){try{if((await fetch('http://localhost:3132')).ok){ready=true;break}}catch{}await delay(1000)}assert.ok(ready,'Next available')
  browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']})
  const context=await browser.newContext({viewport:{width:1440,height:1300},hasTouch:true});const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:3132');await page.getByRole('button',{name:'Editar pergunta 1',exact:true}).click();await page.getByLabel('Título da pergunta',{exact:true}).waitFor();await page.getByRole('button',{name:'Concluir edição',exact:true}).click()
  const cards=page.locator('[data-question-id]'),titles=()=>cards.locator('h3').allTextContents()
  // Move the second card to the end; floating preview + insertion hover must exist before drop.
  const handle=await page.getByRole('button',{name:'Mover pergunta 2',exact:true}).boundingBox(),target=await cards.nth(4).boundingBox();assert.ok(handle&&target)
  await page.mouse.move(handle.x+15,handle.y+20);await page.mouse.down();await page.mouse.move(target.x+80,target.y+target.height-6,{steps:12})
  await page.locator('[data-dragging=true]').waitFor();await page.locator('[data-drop=after]').waitFor();await page.getByText('Solte para mover',{exact:true}).waitFor();await page.screenshot({path:out+'/drag.png'});await page.mouse.up()
  await expect(cards.nth(4).locator('h3')).toHaveText('5. Pergunta 2')
  assert.deepEqual(await titles(),['1. Pergunta 1','2. Pergunta 3','3. Pergunta 4','4. Pergunta 5','5. Pergunta 2'])
  // Arrow keys keep focus on the same question even as its position changes.
  const last=page.getByRole('button',{name:'Mover pergunta 5',exact:true});await last.focus();await page.keyboard.press('ArrowUp');assert.equal(await page.getByRole('button',{name:'Mover pergunta 4',exact:true}).evaluate(e=>e===document.activeElement),true)
  // Reject reversing a conditional dependency; preserve all questions.
  await page.getByRole('button',{name:'Mover pergunta 1',exact:true}).focus();await page.keyboard.press('ArrowDown');await page.getByRole('alert').filter({hasText:'condição'}).waitFor();assert.equal((await titles())[0],'1. Pergunta 1')
  await page.getByRole('button',{name:'Salvar rascunho',exact:true}).click();await page.getByRole('button',{name:'Reabrir rascunho sintético'}).click();assert.equal((await titles())[3],'4. Pergunta 2')
  // Escape cancels, without modifying the draft.
  const before=await titles(),h=await page.getByRole('button',{name:'Mover pergunta 4',exact:true}).boundingBox();assert.ok(h);await page.mouse.move(h.x+10,h.y+15);await page.mouse.down();await page.mouse.move(h.x+100,h.y-60,{steps:5});await page.keyboard.press('Escape');await page.mouse.up();assert.deepEqual(await titles(),before)
  await page.getByRole('button',{name:'Publicar versão',exact:true}).click();assert.match(await page.getByLabel('Versão sintética').innerText(),/Pergunta 1,Pergunta 3,Pergunta 4,Pergunta 2,Pergunta 5/)
  for(const width of [1440,768,320]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);await page.screenshot({path:out+`/builder-${width}.png`})}
  await page.setViewportSize({width:1440,height:1300})
  await page.getByRole('button',{name:'Mover pergunta 4',exact:true}).scrollIntoViewIfNeeded()
  const source=await page.getByRole('button',{name:'Mover pergunta 4',exact:true}).boundingBox(),destination=await cards.nth(4).boundingBox();assert.ok(source&&destination)
  const cdp=await context.newCDPSession(page)
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:source.x+15,y:source.y+20}]})
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:destination.x+70,y:destination.y+destination.height-6}]})
  await page.locator('[data-dragging=true]').waitFor()
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  await expect(cards.nth(4).locator('h3')).toHaveText('5. Pergunta 2')
  assert.deepEqual(errors,[]);await writeFile(out+'/verification.json',JSON.stringify({status:'PASS',chrome:true,dragGhost:true,touch:true,insertionHover:true,keyboardFocus:true,escape:true,conditionGuard:true,draftAndPublishCallbackOrder:true,saveProvider:'synthetic in-memory component contract; not database integration',axe:true,widths:[1440,768,320],errors},null,2));console.info('Intake ordering Chrome PASS')
 }finally{await browser?.close();server?.kill('SIGTERM');if(server&&server.exitCode===null)await new Promise<void>(r=>server!.once('exit',()=>r()));await writeFile(out+'/server.log',output);await rm(directory,{recursive:true,force:true})}
}
main().catch(e=>{console.error(e);process.exitCode=1})
