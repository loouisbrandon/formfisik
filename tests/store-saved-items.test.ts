import {test} from 'node:test'
import assert from 'node:assert/strict'
import {parseSavedItems} from '../src/modules/store/saved-items'
test('local preferences accept only known unique public IDs',()=>{assert.deepEqual(parseSavedItems('["bone","bone","straps","__proto__",1,{},"missing"]'),['bone','straps'])})
test('invalid local storage recovers without trusting payloads',()=>{for(const value of [null,'{','null','{}','"bone"'])assert.deepEqual(parseSavedItems(value),[])})
