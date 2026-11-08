import {test} from 'node:test'
import assert from 'node:assert/strict'
import {searchDates} from '../src/modules/search/dates'
const now=new Date('2026-11-08T01:00:00Z'),zone='America/Sao_Paulo'
test('agenda search resolves relative days in configured timezone',()=>{assert.deepEqual(searchDates('hoje',zone,now),{from:'2026-11-07',to:'2026-11-07'});assert.deepEqual(searchDates('amanhã',zone,now),{from:'2026-11-08',to:'2026-11-08'});assert.deepEqual(searchDates('ontem',zone,now),{from:'2026-11-06',to:'2026-11-06'})})
test('months explicit years dates and invalid dates',()=>{assert.deepEqual(searchDates('novembro',zone,now),{from:'2026-11-01',to:'2026-11-30'});assert.deepEqual(searchDates('fevereiro 2028',zone,now),{from:'2028-02-01',to:'2028-02-29'});assert.deepEqual(searchDates('15/11',zone,now),{from:'2026-11-15',to:'2026-11-15'});assert.deepEqual(searchDates('15 de novembro',zone,now),{from:'2026-11-15',to:'2026-11-15'});assert.equal(searchDates('31/02',zone,now),null);assert.equal(searchDates('treinos',zone,now),null)})
