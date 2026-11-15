import {test} from 'node:test'
import assert from 'node:assert/strict'
import {fuzzyScore,commands} from '../src/modules/search/catalog'
test('command matching ranks prefix and substring above subsequence and ignores accents',()=>{
 assert.equal(fuzzyScore('trei','Treinos e fichas'),100)
 assert.equal(fuzzyScore('evolucao','Acompanhamento e evolução'),80)
 assert.equal(fuzzyScore('trn','Treinos'),40)
 assert.equal(fuzzyScore('xyz','Treinos'),0)
 assert.ok(commands.filter(c=>fuzzyScore('trei',c.name)>0).length>=2)
})
