import {test} from 'node:test'
import assert from 'node:assert/strict'
import {catalogGroups,catalogProducts,filterCatalog,isCatalogGroup} from '../src/modules/store/catalog'
import {storeCategories} from '../src/modules/store/content'
test('three departments share one catalog; existing previews retain identity and no cross-department leakage',()=>{
 assert.deepEqual(Object.keys(catalogGroups),['roupas','acessorios','suplementacao'])
 assert.equal(new Set(catalogProducts.map(p=>p.id)).size,catalogProducts.length)
 assert.equal(filterCatalog('roupas',{}).length,3);assert.equal(filterCatalog('acessorios',{}).length,6);assert.deepEqual(filterCatalog('suplementacao',{}),[])
 for(const group of ['roupas','acessorios','suplementacao'] as const)assert.ok(filterCatalog(group,{}).every(p=>p.group===group))
 assert.equal(isCatalogGroup('oversized'),false);assert.equal(isCatalogGroup('__proto__'),false)
})
test('type, accent-insensitive query and ordering compose without inventing matches',()=>{
 assert.equal(filterCatalog('roupas',{type:'compressao'})[0].id,'compression-lava')
 assert.equal(filterCatalog('roupas',{type:'oversized'})[0].id,'oversized-black')
 assert.equal(filterCatalog('acessorios',{query:'bone'})[0].id,'bone')
 assert.equal(filterCatalog('acessorios',{type:'garrafas',query:'1l'})[0].id,'garrafa')
 assert.deepEqual(filterCatalog('roupas',{type:'bones'}),[])
 assert.deepEqual(filterCatalog('acessorios',{query:'<script>'}),[])
 const asc=filterCatalog('acessorios',{sort:'name_asc'}).map(p=>p.name)
 assert.deepEqual(filterCatalog('acessorios',{sort:'name_desc'}).map(p=>p.name),[...asc].reverse())
})
test('category navigation targets departments with type filters rather than separate type pages',()=>{
 assert.equal(storeCategories.find(c=>c.id==='oversized')?.href,'/store/roupas?tipo=oversized')
 assert.equal(storeCategories.find(c=>c.id==='compressao')?.href,'/store/roupas?tipo=compressao')
 assert.equal(storeCategories.find(c=>c.id==='acessorios')?.href,'/store/acessorios')
})
