import type {Page} from '@playwright/test'
type FeedbackTestDialog={type:()=>string;message:()=>string;accept:(value?:string)=>Promise<void>;dismiss:()=>Promise<void>}
type Handler={callback:(dialog:FeedbackTestDialog)=>unknown;once:boolean}
const pages=new WeakMap<Page,{handlers:Handler[]}>()
/** Test-only adapter: old native-dialog test intentions exercise the actual FormFisik dialog. */
export async function handleFeedback(page:Page,callback:Handler['callback'],options:{once?:boolean}={}){
 let record=pages.get(page)
 if(!record){record={handlers:[]};pages.set(page,record);const active=record
 await page.exposeBinding('__formfisikFeedbackTest',async(_source,payload:{message:string;input:boolean})=>{const handler=active.handlers.find(h=>h.once)??active.handlers.at(-1);if(!handler)return;if(handler.once)active.handlers.splice(active.handlers.indexOf(handler),1);const dialog=page.locator('dialog[data-feedback-confirm][open]'),pending:Promise<unknown>[]=[];const api:FeedbackTestDialog={type:()=>payload.input?'prompt':'confirm',message:()=>payload.message,accept(value){const p=(async()=>{if(payload.input)await dialog.getByLabel('Motivo',{exact:true}).fill(value??'Justificativa sintética de teste');await dialog.locator('button[type=submit]').click()})();pending.push(p);return p},dismiss(){const p=dialog.getByRole('button',{name:'Voltar',exact:true}).click();pending.push(p);return p}};await handler.callback(api);await Promise.all(pending)})
 const install=()=>{const target=window as Window&{__formfisikFeedbackTest?:(payload:{message:string;input:boolean})=>Promise<void>;__feedbackWatching?:boolean};if(target.__feedbackWatching)return;target.__feedbackWatching=true;const seen=new WeakSet<Element>();function scan(){for(const element of document.querySelectorAll('dialog[data-feedback-confirm][open]')){if(seen.has(element))continue;seen.add(element);void target.__formfisikFeedbackTest?.({message:element.querySelector('#feedback-confirm-description')?.textContent??'',input:element.getAttribute('data-feedback-input')==='true'})}};const observer=new MutationObserver(scan);observer.observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});scan()}
 const source='(()=>{const __name=(fn)=>fn;('+install.toString()+')()})()';await page.addInitScript({content:source});await page.evaluate(source)
 }
 record.handlers.push({callback,once:options.once??false})
}
