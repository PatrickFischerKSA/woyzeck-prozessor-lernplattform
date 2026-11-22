import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
const context=vm.createContext({});
vm.runInContext(await readFile(new URL('../public/woyzeck/comparison.js',import.meta.url),'utf8'),context);
const compare=(a,b)=>JSON.parse(JSON.stringify(context.compareMontages(a,b)));
test('a swap marks both affected scenes and both sets of changed joins',()=>{
  const result=compare([2,16,20],[2,20,16]);
  assert.deepEqual(result.moved,[20,16]);
  assert.deepEqual(result.transitionsA.filter(edge=>edge.changed),[{from:2,to:16,changed:true},{from:16,to:20,changed:true},{from:20,to:null,changed:true}]);
  assert.deepEqual(result.transitionsB.filter(edge=>edge.changed),[{from:2,to:20,changed:true},{from:20,to:16,changed:true},{from:16,to:null,changed:true}]);
});
test('inserting a scene distinguishes shifted positions from changed relative order',()=>{
  const result=compare([1,2,3],[1,8,2,3]);
  assert.deepEqual(result.moved,[]);assert.deepEqual(result.shifted,[2,3]);assert.deepEqual(result.added,[8]);
  assert.equal(result.transitionsB.find(edge=>edge.from===2&&edge.to===3).changed,false);
});
test('changed opening and closing are included, identical montages have no changed joins',()=>{
  assert.ok(compare([1,2],[2,1]).transitionsB.every(edge=>edge.changed));
  assert.ok(compare([1,2],[1,2]).transitionsA.every(edge=>!edge.changed));
});
test('notes belong to an exact pair and malformed backup data is discarded',()=>{
  assert.notEqual(context.montageComparisonKey([1,2],[2,1]),context.montageComparisonKey([1,2],[1,2]));
  const key=context.montageComparisonKey([1,2],[2,1]);
  const result=JSON.parse(JSON.stringify(context.cleanTransitionNotes({[key]:{'B:2:1':'Neue Lesart','A:start:1':'Erwartung','B:1:end':3,'wrong':'ignore'},bad:{}})));
  assert.deepEqual(result,{[key]:{'B:2:1':'Neue Lesart','A:start:1':'Erwartung'}});
  assert.deepEqual(JSON.parse(JSON.stringify(context.cleanTransitionNotes(null))),{});
});
