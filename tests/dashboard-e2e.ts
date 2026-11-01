// Isolated UI harness generated under /tmp. It is not a route or a bypass in the application.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, mkdir, readFile, writeFile, symlink, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { subscriptionFixture } from './helpers/subscription-views'
async function main() {
  const root=process.cwd(), directory=await mkdtemp(join(tmpdir(),'formfisik-dashboard-ui-'))
  const data=JSON.parse(await readFile('test-results/dashboard-data.json','utf8'))
  await mkdir(join(directory,'app/dashboard'),{recursive:true})
  await symlink(join(root,'node_modules'),join(directory,'node_modules'),'dir')
  await writeFile(join(directory,'package.json'),JSON.stringify({private:true,dependencies:{next:'16.4.3',react:'19.2.4','react-dom':'19.2.4'}}))
  await writeFile(join(directory,'tsconfig.json'),JSON.stringify({extends:join(root,'tsconfig.json'),compilerOptions:{paths:{'@/*':[join(root,'src/*')]}},include:['app/**/*.tsx','.next/**/*.ts']}))
  await writeFile(join(directory,'next.config.js'),`module.exports={devIndicators:false,outputFileTracingRoot:${JSON.stringify(root)},webpack(config){config.resolve.alias['@']=${JSON.stringify(join(root,'src'))};return config}}`)
  await writeFile(join(directory,'postcss.config.mjs'),await readFile(join(root,'postcss.config.mjs'),'utf8'))
  await writeFile(join(directory,'app/layout.tsx'),`export {default} from ${JSON.stringify(join(root,'src/app/layout'))}`)
  await writeFile(join(directory,'app/dashboard/page.tsx'),`import {ProfessionalShell} from ${JSON.stringify(join(root,'src/modules/professional/shell'))};import {DashboardContent} from ${JSON.stringify(join(root,'src/modules/professional/dashboard-content'))};import {DashboardAccessMonitor} from ${JSON.stringify(join(root,'src/modules/professional/access-monitor'))};export const metadata={title:'Dashboard profissional | FormFisik'};export default function Page(){const data=${JSON.stringify(data)};return <ProfessionalShell fullName={data.fullName} professional><DashboardAccessMonitor><DashboardContent data={data}/></DashboardAccessMonitor></ProfessionalShell>}`)
  await mkdir(join(directory,'app/assinatura/gerenciar'),{recursive:true})
  await writeFile(join(directory,'app/assinatura/gerenciar/page.tsx'),`import {ProfessionalShell} from ${JSON.stringify(join(root,'src/modules/professional/shell'))};import {SubscriptionDashboard} from ${JSON.stringify(join(root,'src/modules/subscriptions/subscription-dashboard'))};export const metadata={title:'Minha assinatura | FormFisik'};export default function Page(){return <ProfessionalShell fullName=${JSON.stringify(data.fullName)} professional><h1>Minha assinatura</h1><SubscriptionDashboard/></ProfessionalShell>}`)
  const server=spawn(process.execPath,[join(root,'node_modules/next/dist/bin/next'),'dev',directory,'--webpack','--port','3109'],{cwd:root,stdio:['ignore','pipe','pipe']})
  let output='';server.stdout.on('data',chunk=>output+=chunk);server.stderr.on('data',chunk=>output+=chunk)
  let browser
  try {
    let ready=false
    for(let i=0;i<90;i++){try{if((await fetch('http://localhost:3109/dashboard')).ok){ready=true;break}}catch{}if(server.exitCode!==null)throw new Error('UI harness stopped');await delay(1000)}
    if(!ready)throw new Error('UI harness readiness timeout')
    browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']})
    const context=await browser.newContext({viewport:{width:1440,height:1000}})
    const page=await context.newPage()
    let accessStatus=200,logoutCalls=0
    await page.route('**/api/auth/session',route=>route.fulfill({json:{user:{fullName:data.fullName}}}))
    await page.route('**/api/professional/dashboard',route=>route.fulfill({status:accessStatus,json:accessStatus===200?{status:'allowed',data}:{status:'unavailable'}}))
    await page.route('**/api/subscriptions/status*',route=>route.fulfill({json:subscriptionFixture('active',Date.now())}))
    await page.route('**/api/auth/logout',route=>{logoutCalls++;return route.fulfill({json:{message:'Sessão encerrada.'}})})
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
    await page.goto('http://localhost:3109/dashboard')
    await page.getByRole('heading',{level:1,name:'Boas-vindas, '+data.fullName+'.'}).waitFor()
    assert.equal(await page.getByRole('main').count(),1)
    assert.equal(await page.getByRole('link',{name:'Dashboard',exact:true}).getAttribute('aria-current'),'page')
    assert.equal(await page.getByRole('link',{name:'Alunos',exact:true}).getAttribute('href'),'/alunos')
    assert.equal(await page.getByRole('region',{name:'Indicadores operacionais'}).count(),1)
    await page.getByText('Nenhuma atividade operacional disponível',{exact:true}).waitFor()
    assert.equal(await page.getByRole('link',{name:'Revisar minha conta'}).getAttribute('href'),'/conta')
    assert.equal(await page.getByRole('link',{name:'Consultar assinatura'}).getAttribute('href'),'/assinatura/gerenciar')
    await mkdir('test-results/dashboard',{recursive:true})
    for(const width of [1440,1280,768,320]){
      await page.setViewportSize({width,height:900})
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'No horizontal overflow '+width)
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()
      assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[])
      await page.screenshot({path:`test-results/dashboard/first-access-${width}.png`,fullPage:true})
      if(width<1024){
        const trigger=page.getByRole('button',{name:'Abrir navegação'})
        await trigger.click()
        const dialog=page.getByRole('dialog',{name:'Menu profissional'})
        await dialog.waitFor();assert.equal(await trigger.getAttribute('aria-expanded'),'true')
        const menuAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()
        assert.deepEqual(menuAxe.violations.map(v=>v.id),[])
        await page.screenshot({path:`test-results/dashboard/navigation-${width}.png`,fullPage:true})
        await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'})
        assert.equal(await trigger.evaluate(el=>el===document.activeElement),true)
      }
    }
    await page.getByRole('button',{name:'Abrir navegação'}).click()
    await page.getByRole('dialog',{name:'Menu profissional'}).getByRole('link',{name:'Minha assinatura',exact:true}).click()
    await page.waitForURL('**/assinatura/gerenciar')
    await page.getByTestId('subscription-state').waitFor()
    assert.equal(await page.getByRole('dialog',{name:'Menu profissional'}).count(),0)
    await page.goto('http://localhost:3109/dashboard')
    await page.getByRole('heading',{name:'Organize sua carteira'}).waitFor()
    await page.setViewportSize({width:640,height:450})
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth))
    await page.screenshot({path:'test-results/dashboard/zoom-reflow-200.png',fullPage:true})
    await page.setViewportSize({width:1280,height:900})
    const zoom=await page.addStyleTag({content:'html{font-size:200%!important}'})
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth))
    assert.ok(await page.evaluate(()=>Array.from(document.querySelectorAll('main section, main a')).every(el=>el.scrollWidth<=el.clientWidth+1)))
    const first=await page.getByRole('link',{name:'Revisar minha conta'}).boundingBox(), second=await page.getByRole('link',{name:'Consultar assinatura'}).boundingBox()
    assert.ok(first && second && (first.y+first.height<=second.y || first.x+first.width<=second.x),'Onboarding actions must not overlap at 200% text')
    await page.screenshot({path:'test-results/dashboard/text-zoom-200.png',fullPage:true})
    await zoom.evaluate(el=>el.parentNode?.removeChild(el))
    await page.getByRole('link',{name:'Ir para o conteúdo',exact:true}).focus();await page.keyboard.press('Enter')
    assert.equal(await page.locator('#app-content').evaluate(el=>el===document.activeElement),true)
    accessStatus=503;await page.evaluate(()=>window.dispatchEvent(new Event('focus')))
    await page.getByRole('heading',{name:'Não foi possível confirmar seu acesso'}).waitFor()
    assert.equal(await page.getByRole('heading',{name:'Organize sua carteira'}).count(),0)
    await page.screenshot({path:'test-results/dashboard/access-unavailable.png',fullPage:true})
    accessStatus=200;await page.evaluate(()=>window.dispatchEvent(new Event('focus')))
    await page.getByRole('heading',{name:'Organize sua carteira'}).waitFor()
    await page.goto('http://localhost:3109/assinatura/gerenciar')
    await page.getByTestId('subscription-state').waitFor()
    const financialZoom=await page.addStyleTag({content:'html{font-size:200%!important}'})
    await page.screenshot({path:'test-results/dashboard/subscription-shell-text-zoom-200.png',fullPage:true})
    const overflow=await page.evaluate(()=>Array.from(document.querySelectorAll('main section')).filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>({id:el.getAttribute('aria-labelledby'),client:el.clientWidth,scroll:el.scrollWidth})))
    assert.deepEqual(overflow,[])
    await financialZoom.evaluate(el=>el.parentNode?.removeChild(el))
    await page.getByRole('button',{name:'Sair da conta',exact:true}).click();await page.waitForURL('**/login')
    assert.equal(logoutCalls,1);assert.deepEqual(errors,[])
    console.log('Dashboard UI: real PostgreSQL test identity/entitlement fixture, 4 widths, modal keyboard/focus, axe, zoom, retry, logout: PASS. Production authorization tested separately against real sessions and controlled provider.')
  } catch(error){console.error(output.slice(-5000));throw error}
  finally{await browser?.close();server.kill('SIGTERM');await new Promise<void>(resolve=>server.once('exit',()=>resolve()));await rm(directory,{recursive:true,force:true})}
}
main().catch(error=>{console.error(error);process.exitCode=1})
