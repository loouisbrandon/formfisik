import {test} from 'node:test'
import assert from 'node:assert/strict'
import {existsSync} from 'node:fs'
import {join} from 'node:path'
import {categories,published,articleUrl,searchTutorials} from '../src/modules/tutorials/content'
test('tutorials publish real counts for sixteen categories and unique complete articles',()=>{assert.equal(categories.length,16);assert.equal(published.length,16);assert.equal(new Set(published.map(t=>t.slug)).size,published.length);for(const c of categories)assert.ok(published.some(t=>t.category===c.id));for(const a of published){assert.ok(categories.some(c=>c.id===a.category));assert.equal(a.status,'published');assert.match(a.updated,/^\d{4}-\d{2}-\d{2}$/);assert.ok(a.title&&a.description&&a.purpose&&a.important&&a.tip&&a.steps.length>=8);assert.ok(a.steps.every(s=>s.title&&s.text));assert.ok(existsSync(join('src/app/(app)',a.href,'page.tsx')),a.href);for(const id of a.related)assert.ok(published.some(t=>t.slug===id),id);assert.equal(new URL(articleUrl(a.slug),'https://example.test').searchParams.get('artigo'),a.slug)}})
test('tutorial search indexes title category description and content, ranks and normalizes accents',()=>{assert.equal(searchTutorials('alunos')[0].category,'alunos');assert.ok(searchTutorials('FINANCEIRO').some(t=>t.category==='financeiro'));assert.ok(searchTutorials('revogação').some(t=>t.category==='videos')||searchTutorials('revogado').some(t=>t.category==='videos'));assert.ok(searchTutorials('preferencias').some(t=>t.category==='configuracoes'));assert.ok(searchTutorials('sem comissão').some(t=>t.category==='financeiro'));assert.deepEqual(searchTutorials('ZZZ_UNMATCHED_2026'),[]);assert.deepEqual(searchTutorials('<script>'),[]);assert.equal(searchTutorials('', 'alunos').length,1)})
test('tutorials clearly distinguish local previews, declarations, optional payments and unavailable channels',()=>{const at=(c:string)=>published.find(a=>a.category===c)!;assert.match(at('configuracoes').important,/não são publicados/);assert.match(at('comunicacao').important,/não envia mensagem/);assert.match(at('financeiro').important,/sem comissão/);assert.match(at('financeiro').important,/não causa bloqueio automático/);assert.match(at('checkins').important,/não comprovação de treino/);assert.match(at('videos').steps[1].text,/só funciona quando/);assert.ok(!JSON.stringify(published).includes('DATABASE_URL'));assert.ok(!JSON.stringify(published).includes('node_modules'))})

test('expanded guidance is complete, unique per article and indexed by the same search',()=>{
 for(const a of published){assert.equal(new Set(a.steps.map(s=>s.title)).size,a.steps.length);for(const s of a.steps){assert.ok(s.details&&s.details.length>=2);assert.ok(s.details.every(d=>d.trim().length>30))}}
 assert.ok(searchTutorials('duplicidades').some(a=>a.category==='alunos'))
 assert.ok(searchTutorials('parcial quitação').some(a=>a.category==='financeiro'))
 assert.ok(searchTutorials('condicional arraste').some(a=>a.category==='anamneses'))
 assert.ok(searchTutorials('reagendamento').some(a=>a.category==='crm'))
 assert.ok(searchTutorials('incorporação bloqueada').some(a=>a.category==='videos'))
})
