import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
const source=await readFile(new URL('../public/woyzeck/manuscript.js',import.meta.url),'utf8');
function fixture(){
  const keys=['liebling','ist','dialog'];
  const element=()=>({value:'',hidden:true,disabled:false,attributes:{},events:{},dataset:{},textContent:'',setAttribute(key,value){this.attributes[key]=value;},addEventListener(key,callback){this.events[key]=callback;}});
  const spots=Object.fromEntries(keys.map(key=>[key,{fields:[element(),element()],button:element(),answer:element(),status:element()}]));
  for(const key of keys){spots[key].button.dataset.manuscriptReveal=key;for(const field of spots[key].fields)field.dataset.manuscriptAttempt=key;}
  const events={};
  const document={
    querySelectorAll(selector){
      if(selector==='[data-manuscript-attempt]')return keys.flatMap(key=>spots[key].fields);
      if(selector==='[data-manuscript-reveal]')return keys.map(key=>spots[key].button);
      const match=selector.match(/^\[data-manuscript-attempt="(.+)"\]$/);return match?spots[match[1]].fields:[];
    },
    querySelector(selector){
      const match=selector.match(/^\[data-manuscript-(reveal|answer)="(.+)"\]$/);
      if(match)return spots[match[2]][match[1]==='reveal'?'button':'answer'];
      return spots[selector.replace('#gate-','')].status;
    },addEventListener(name,callback){events[name]=callback;}
  };
  const context=vm.createContext({document,manuscriptSpots:Object.fromEntries(keys.map(key=>[key,{}]))});
  vm.runInContext(source.slice(source.indexOf('const revealedManuscripts')),context);
  const type=(key,index,value)=>{const field=spots[key].fields[index];field.value=value;field.events.input();};
  return {spots,type,events};
}
test('requires both an attempt and a hypothesis for each trace, without judging correctness',()=>{
  const f=fixture(),a=f.spots.liebling;
  assert.equal(a.button.disabled,true);assert.equal(a.answer.hidden,true);
  f.type('liebling',0,'Ich kann nur [?] erkennen.');assert.equal(a.button.disabled,true);
  f.type('liebling',1,'   ');assert.equal(a.button.disabled,true);
  f.type('liebling',1,'Vielleicht eine Ersetzung; die Schrift bleibt für mich unsicher.');
  assert.equal(a.button.disabled,false);assert.equal(a.answer.hidden,true);
  a.button.events.click();assert.equal(a.answer.hidden,false);assert.equal(a.button.attributes['aria-expanded'],'true');
  assert.equal(f.spots.ist.answer.hidden,true);assert.equal(f.spots.ist.button.disabled,true);
});
test('closing and reopening preserves attempts; clearing an attempt hides its answer',()=>{
  const f=fixture(),a=f.spots.liebling;
  f.type('liebling',0,'Mein Versuch');f.type('liebling',1,'Meine Vermutung');
  a.button.events.click();a.button.events.click();assert.equal(a.answer.hidden,true);
  assert.equal(a.fields[0].value,'Mein Versuch');a.button.events.click();assert.equal(a.answer.hidden,false);
  f.type('liebling',0,'');assert.equal(a.answer.hidden,true);assert.equal(a.button.disabled,true);
});
test('restoring a backup closes solutions while retaining restored work',()=>{
  const f=fixture(),a=f.spots.dialog;
  f.type('dialog',0,'Eigene Lesung');f.type('dialog',1,'Eigene Hypothese');a.button.events.click();
  f.events.manuscriptrestore();assert.equal(a.answer.hidden,true);assert.equal(a.button.disabled,false);
  assert.equal(a.fields[1].value,'Eigene Hypothese');
});
