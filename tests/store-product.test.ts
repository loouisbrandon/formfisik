import {test} from 'node:test'
import assert from 'node:assert/strict'
import {getStoreProduct} from '../src/modules/store/product'
import {catalogProducts} from '../src/modules/store/catalog'
test('every catalog preview has a detail without fabricated commercial data',()=>{for(const item of catalogProducts){const product=getStoreProduct(item.id);assert.ok(product);assert.equal(product.id,item.id);assert.ok(product.description);assert.equal(product.priceCents,null);assert.equal(product.availability,'coming_soon');assert.equal(product.images[0]?.src,item.image?.src)}})
test('unknown and prototype names do not resolve as products',()=>{for(const id of ['missing','__proto__','constructor',''])assert.equal(getStoreProduct(id),undefined)})
