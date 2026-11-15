import {loadEnvConfig} from '@next/env'
import {randomUUID} from 'node:crypto'
import assert from 'node:assert/strict'
import {chromium} from '@playwright/test'
import {db} from '../src/server/db'
import {createSession,cookieName} from '../src/server/sessions'
import {consentFingerprint} from '../src/server/ecoach/provider'
loadEnvConfig(process.cwd())
const target=new URL(process.env.DATABASE_URL!);if(target.hostname!=='127.0.0.1'||target.pathname!=='/formfisik_local_test')throw Error('Local only')
const owner=randomUUID(),origin='http://localhost:3000'
async function run(){const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});try{
 await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Teste de escopo','professional',now())",[owner,owner+'@example.test'])
 await db().query("INSERT INTO complimentary_access_grants(id,user_id,environment,reason,authorization_reference) VALUES($1,$2,'local','owner_authorized_test',$3)",[randomUUID(),owner,randomUUID()])
 await db().query('INSERT INTO professional_settings(user_id,preferences) VALUES($1,$2)',[owner,{ecoach:'manage',ecoachExternalConsent:consentFingerprint()}])
 const session=await createSession(owner),context=await browser.newContext({viewport:{width:1440,height:900}});await context.addCookies([{name:cookieName(),value:session.token,url:origin}]);const page=await context.newPage()
 await page.goto(origin+'/ecoach');await page.getByLabel('Mensagem para o eCoach',{exact:true}).waitFor({timeout:60000});const transcript=page.getByLabel('Histórico da conversa',{exact:true}),before=await transcript.boundingBox();await page.getByRole('button',{name:'Conversas',exact:true}).click();await page.getByRole('region',{name:'Histórico de conversas',exact:true}).waitFor();const compressed=await transcript.boundingBox();assert.ok(compressed!.width<before!.width-100);assert.ok(compressed!.x>before!.x+100);await page.getByLabel('Mensagem para o eCoach',{exact:true}).click();assert.equal(await page.getByRole('button',{name:'Conversas',exact:true}).getAttribute('aria-expanded'),'true');await page.getByRole('button',{name:'Conversas',exact:true}).click();assert.equal(await page.getByRole('region',{name:'Histórico de conversas',exact:true}).count(),0);
 await page.getByLabel('Mensagem para o eCoach',{exact:true}).fill('Para montar meu treino escreva código Python');await page.getByRole('button',{name:'Enviar mensagem',exact:true}).click();await page.getByText('orientação de escopo',{exact:false}).waitFor({timeout:15000});assert.equal(await page.getByText('Pensando na resposta…',{exact:true}).count(),0)
 await page.getByRole('button',{name:'Conversas',exact:true}).click();await page.getByRole('region',{name:'Histórico de conversas',exact:true}).waitFor();
 for(const width of [1440,768,320]){await page.setViewportSize({width,height:480});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true)}
 await page.setViewportSize({width:1440,height:900});await page.screenshot({path:'/tmp/ecoach-history-sidebar.png'});await page.getByRole('button',{name:'Conversas',exact:true}).click();await page.keyboard.press('Control+k');await page.getByRole('button',{name:/eCoach/}).first().click();await page.locator('#ecoach-finder-message').fill('Qual a distância até a lua?');const response=page.waitForResponse(r=>r.url().endsWith('/api/ecoach/conversations')&&r.request().method()==='POST');await page.locator('#ecoach-finder-message').press('Enter');const completed=await response;assert.equal(completed.status(),200);assert.equal((await completed.json()).conversation.turns.at(-1).mode,'policy');await page.locator('#ecoach-finder-message').waitFor({state:'visible'});await page.getByText('Não posso atender esse pedido.',{exact:false}).first().waitFor();
 await page.getByRole('button',{name:'Enviar mensagem',exact:true}).last().waitFor();await page.addStyleTag({content:'html{font-size:200%}'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 const count=await db().query('SELECT count(*)::int n FROM ecoach_ai_requests WHERE owner_id=$1',[owner]);assert.equal(count.rows[0].n,0);await page.screenshot({path:'/tmp/ecoach-scope-browser.png'});console.log('Browser: chat/Finder policy, responsive shell and zero provider requests verified')
 }finally{await browser.close();await db().query('DELETE FROM complimentary_access_grants WHERE user_id=$1',[owner]);await db().query('DELETE FROM users WHERE id=$1',[owner]);await db().end()}}
run().catch(e=>{console.error(e instanceof Error?e.message:'Browser failed');process.exitCode=1})
