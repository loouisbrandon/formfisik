import assert from 'node:assert/strict'
import {spawn} from 'node:child_process'
import {mkdtemp,mkdir,writeFile,readFile,symlink,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {setTimeout as delay} from 'node:timers/promises'
import {chromium} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
async function main(){
 const root=process.cwd(),directory=await mkdtemp(join(tmpdir(),'formfisik-media-ui-'))
 const backend=spawn(process.execPath,['--conditions=react-server','--import','tsx','tests/helpers/media-browser-server.ts'],{stdio:['ignore','pipe','pipe','ipc'],env:process.env})
 let server:ReturnType<typeof spawn>|undefined,browser
 let output='';backend.stdout?.on('data',chunk=>output+=chunk);backend.stderr?.on('data',chunk=>output+=chunk)
 try{
  const ready=await new Promise<{token:string;exercise:string;foreignId:string}>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Backend readiness timeout')),30000);backend.on('message',message=>{const data=message as {type:string;token:string;exercise:string;foreignId:string};if(data.type==='ready'){clearTimeout(timer);resolve(data)}});backend.once('exit',()=>reject(new Error('Backend exited')))})
  await symlink(join(root,'node_modules'),join(directory,'node_modules'),'dir')
  await writeFile(join(directory,'package.json'),JSON.stringify({private:true,dependencies:{next:'16.4.3',react:'19.2.4','react-dom':'19.2.4'}}))
  await writeFile(join(directory,'tsconfig.json'),JSON.stringify({extends:join(root,'tsconfig.json'),compilerOptions:{paths:{'@/*':[join(root,'src/*')]}},include:['app/**/*.tsx','.next/**/*.ts']}))
  await writeFile(join(directory,'next.config.js'),`module.exports={devIndicators:false,outputFileTracingRoot:${JSON.stringify(root)},webpack(config){config.resolve.alias['@']=${JSON.stringify(join(root,'src'))};return config}}`)
  await writeFile(join(directory,'postcss.config.mjs'),await readFile(join(root,'postcss.config.mjs'),'utf8'))
  await mkdir(join(directory,'app'),{recursive:true});await writeFile(join(directory,'app/layout.tsx'),`export {default} from ${JSON.stringify(join(root,'src/app/layout'))}`)
  await mkdir(join(directory,'app/(private)'),{recursive:true})
  await writeFile(join(directory,'app/(private)/layout.tsx'),`import {ProfessionalShell} from ${JSON.stringify(join(root,'src/modules/professional/shell'))};export default function Layout({children}:{children:React.ReactNode}){return <ProfessionalShell fullName="Profissional de teste" professional>{children}</ProfessionalShell>}`)
  const routeDir=join(directory,'app/(private)/videos');await mkdir(routeDir,{recursive:true});await writeFile(join(routeDir,'page.tsx'),`import {MediaArea} from ${JSON.stringify(join(root,'src/modules/media/area'))};export const metadata={title:'Agenda | FormFisik'};export default function Page(){return <MediaArea/>}`)
  server=spawn(process.execPath,[join(root,'node_modules/next/dist/bin/next'),'dev',directory,'--webpack','--port','3134'],{stdio:['ignore','pipe','pipe']})
  server.stdout?.on('data',chunk=>output+=chunk);server.stderr?.on('data',chunk=>output+=chunk)
  let available=false;for(let i=0;i<90;i++){try{if((await fetch('http://localhost:3134/videos')).ok){available=true;break}}catch{}if(server.exitCode!==null)break;await delay(1000)}if(!available)throw new Error('Next readiness timeout')
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']})
  const apiMeasurements:{method:string;path:string;operation:string|null;status:number;bytes:number;keys:string[]}[]=[]
  function measured(original:{method:()=>string;postData:()=>string|null},url:URL,response:Response,body:Buffer){let operation:string|null=null,keys:string[]=[];try{const p=JSON.parse(original.postData()||'{}');operation=p.action??p.operation??null;keys=Object.keys(JSON.parse(body.toString()))}catch{}apiMeasurements.push({method:original.method(),path:url.pathname,operation:operation??url.searchParams.get('view'),status:response.status,bytes:body.length,keys})}
  const context=await browser.newContext({viewport:{width:1440,height:1000}})
  await context.addCookies([{name:'formfisik-session',value:ready.token,url:'http://localhost:3134',httpOnly:true,sameSite:'Lax'}])
  await context.route('**/api/**',async route=>{const original=route.request(),url=new URL(original.url());const response=await fetch('http://127.0.0.1:3135'+url.pathname+url.search,{method:original.method(),headers:await original.allHeaders(),body:['GET','HEAD'].includes(original.method())?undefined:original.postData()});const body=Buffer.from(await response.arrayBuffer());measured(original,url,response,body);await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body})})
  const page=await context.newPage();page.setDefaultTimeout(25000);page.setDefaultNavigationTimeout(60000)
  await context.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({contentType:'text/html',body:'<html><body>Official embed transport replaced only in test</body></html>'}));
  await context.route('https://www.youtube.com/iframe_api',r=>r.fulfill({contentType:'text/javascript',body:'window.YT={Player:function(){this.destroy=function(){};}};window.onYouTubeIframeAPIReady?.();'}));
  await context.route('https://upload.videodelivery.net/**',async r=>{await fetch('http://127.0.0.1:3135/fixture/complete');await r.fulfill({status:200,body:'{}'})});
  await context.route('https://customer-controlled.cloudflarestream.com/**',r=>r.fulfill({contentType:'text/html',body:'<html><body>Controlled Stream playback</body></html>'}));
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const out='test-results/023/browser';await mkdir(out,{recursive:true});const rejectDiscard=false;page.on('dialog',async d=>{if(rejectDiscard&&d.message().includes('Descartar'))await d.dismiss();else await d.accept()})
  await page.goto('http://localhost:3134/videos?exerciseId='+ready.exercise)
  await page.getByText('Exercício selecionado: Supino sintético mídia',{exact:true}).waitFor()
  await page.getByRole('button',{name:'Adicionar link do YouTube',exact:true}).click()
  await page.getByLabel('URL do YouTube',{exact:true}).fill('https://youtu.be/abcdefghijk?si=tracking')
  await page.getByLabel('Título do vídeo',{exact:true}).fill('Demonstração Chrome')
  await page.getByText('Descrição e referência de direitos',{exact:true}).click();await page.getByLabel('Descrição opcional',{exact:true}).fill('Orientação sintética sem pessoas reais')
  await page.getByLabel('Referência de autoria ou direito de incorporação').fill('Licença sintética somente teste')
  await page.getByLabel('Declaro que sou o autor',{exact:false}).check()
  await page.getByLabel('Conferi as autorizações',{exact:false}).check()
  await page.getByRole('button',{name:'Salvar demonstração',exact:true}).click()
  const card=page.getByRole('article').filter({has:page.getByRole('heading',{name:'Demonstração Chrome',exact:true})});await card.waitFor()
  assert.equal(await page.locator('iframe').count(),0)
  await card.getByRole('button',{name:'Ver detalhes',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Pré-visualizar Demonstração Chrome',exact:true}).click()
  const modal=page.getByRole('dialog',{name:'Pré-visualização da demonstração'});await modal.waitFor();await modal.getByRole('button',{name:'Carregar vídeo',exact:true}).click();await modal.locator('iframe').waitFor()
  assert.ok((await modal.locator('iframe').getAttribute('src'))?.includes('youtube-nocookie.com/embed/abcdefghijk'))
  assert.equal(await modal.locator('iframe').getAttribute('referrerpolicy'),'strict-origin-when-cross-origin')
  await page.keyboard.press('Escape');await modal.waitFor({state:'detached'});assert.equal(await page.locator('iframe').count(),0)
  assert.equal(await page.getByRole('dialog').getByRole('button',{name:'Pré-visualizar Demonstração Chrome',exact:true}).evaluate(e=>document.activeElement===e),true)
  await page.getByText('Gerenciar demonstração',{exact:true}).click()
  await page.getByRole('dialog').getByRole('button',{name:'Arquivar',exact:true}).click();await page.getByRole('button',{name:'Fechar painel',exact:true}).click();await card.waitFor({state:'detached'})
  await page.getByLabel('Situação',{exact:true}).selectOption('archived');const archived=page.getByRole('article').filter({has:page.getByRole('heading',{name:'Demonstração Chrome',exact:true})});await archived.waitFor();await archived.getByRole('button',{name:'Ver detalhes',exact:true}).click();await page.getByText('Gerenciar demonstração',{exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Reativar',exact:true}).click();await page.getByRole('button',{name:'Fechar painel',exact:true}).click();await page.getByLabel('Situação',{exact:true}).selectOption('active');await card.waitFor()
  const foreign=await context.request.get('http://localhost:3134/api/media?view=detail&id='+ready.foreignId).catch(()=>null)
  // APIRequestContext does not use page routing; IDOR is verified directly through fixture with cookie.
  const denied=await fetch('http://127.0.0.1:3135/api/media?view=detail&id='+ready.foreignId,{headers:{cookie:'formfisik-session='+ready.token}});assert.equal(denied.status,404);void foreign
  await page.getByRole('button',{name:'Enviar vídeo próprio',exact:true}).click();await page.getByLabel('Arquivo MP4 ou MOV, até 200 MB').setInputFiles({name:'synthetic.mp4',mimeType:'video/mp4',buffer:Buffer.from('SYNTHETIC_CONTROLLED_VIDEO')});await page.getByLabel('Título do vídeo',{exact:true}).fill('Upload Chrome');await page.getByLabel('Referência de autoria ou direito de incorporação').fill('Direitos sintéticos de teste');await page.getByLabel('Declaro que sou o autor',{exact:false}).check();await page.getByLabel('Conferi as autorizações',{exact:false}).check();await page.getByRole('button',{name:'Enviar vídeo',exact:true}).click()
  await page.getByText('Upload recebido.',{exact:false}).waitFor()
  // Verify processing through the same authorized API as runtime.
  const library=await fetch('http://127.0.0.1:3135/api/media?view=library',{headers:{cookie:'formfisik-session='+ready.token}});const data=await library.json();const upload=data.items.find((v:{title:string})=>v.title==='Upload Chrome');assert.ok(upload)
  const sync=await fetch('http://127.0.0.1:3135/api/media',{method:'POST',headers:{cookie:'formfisik-session='+ready.token,origin:'http://localhost:3134','content-type':'application/json'},body:JSON.stringify({action:'reconcile',operationKey:crypto.randomUUID(),confirmed:true,id:upload.id})});assert.equal(sync.status,200)
  await page.getByLabel('Buscar vídeo ou exercício').fill('Upload Chrome');await page.getByRole('article').filter({has:page.getByRole('heading',{name:'Upload Chrome',exact:true})}).waitFor()
  await page.locator('#app-content').evaluate(e=>e.scrollTop=0)
  for(const width of [1440,768,375,320]){await page.setViewportSize({width,height:800});await delay(200);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await page.evaluate(()=>{window.scrollTo(0,3000);return window.scrollY===0&&document.documentElement.scrollHeight<=innerHeight+1}));const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.length})),[]);await page.screenshot({path:out+'/library-'+width+'.png'})}
  await page.setViewportSize({width:1440,height:500});await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:out+'/zoom-200.png'});await page.evaluate(()=>document.documentElement.style.fontSize='')
  assert.deepEqual(errors,[]);await writeFile('test-results/023/browser-proof.json',JSON.stringify({passed:true,widths:[1440,768,375,320],axe:true,keyboardModal:true,focusRestored:true,youtubeLazy:true,uploadsControlled:true,externalHomologation:false,archiveReactivate:true,idor404:true,errors},null,2));await writeFile('test-results/023/api-measurements.json',JSON.stringify(apiMeasurements,null,2));console.info('023 Chrome E2E PASS')
 }catch(error){const p=browser?.contexts()[0]?.pages()[0];if(p){console.error((await p.locator('body').innerText()).slice(-4500));await p.screenshot({path:'test-results/023/browser-failure.png'}).catch(()=>{})}console.error(output.slice(-1000));throw error}finally{await browser?.close();server?.kill('SIGTERM');backend.kill('SIGTERM');if(server&&server.exitCode===null)await new Promise<void>(resolve=>server!.once('exit',()=>resolve()));if(backend.exitCode===null)await new Promise<void>(resolve=>backend.once('exit',()=>resolve()));await rm(directory,{recursive:true,force:true})}
}
main().catch(error=>{console.error(error instanceof Error?error.stack:error);process.exitCode=1})
