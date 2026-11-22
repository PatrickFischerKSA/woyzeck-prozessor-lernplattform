import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
const helper=await readFile(new URL('../public/woyzeck/montage-arguments.js',import.meta.url),'utf8');
const controller=await readFile(new URL('../public/woyzeck/montage-inquiry.js',import.meta.url),'utf8');
const app=await readFile(new URL('../public/woyzeck/app.js',import.meta.url),'utf8');
const renderReading=app.slice(app.indexOf('function renderReading()'),app.indexOf('function buildInterpretation('));
function fixture(){
  const element=()=>({value:'',disabled:false,hidden:true,textContent:'',attributes:{},events:{},setAttribute(key,value){this.attributes[key]=value;},addEventListener(key,callback){this.events[key]=callback;}});
  const elements=Object.fromEntries(['montageReadingInput','montageEvidenceInput','montageRevisionInput','revealMontageBtn','montageSuggestions','montageGateStatus'].map(id=>[id,element()]));
  const events={};let saved=0,generated=0;
  const outputs={plotOutput:element(),interpretationOutput:element(),murderOutput:element()};
  const context=vm.createContext({
    document:{querySelector:selector=>elements[selector.slice(1)],addEventListener:(name,callback)=>{events[name]=callback;}},
    build:[1,2],readingRevealedFor:null,montageArguments:{},...outputs,
    persistWorkshop:()=>{saved++;},sceneById:id=>({id,motifs:['Motiv']}),positionOf:()=>null,
    formatSceneRef:scene=>`Karte ${scene.id}`,motifLine:()=>'',
    buildInterpretation:()=>{generated++;return 'Automatischer Vorschlag';},buildMurderExplanation:()=> 'Gewalt und Verantwortung',
  });
  vm.runInContext(helper+'\n'+renderReading+'\n'+controller,context);
  const type=(id,value)=>{elements[id].value=value;elements[id].events.input();};
  return {context,elements,events,outputs,type,generated:()=>generated,saved:()=>saved};
}
test('an explicit reveal after both entries is required; refresh alone creates no interpretation',()=>{
  const f=fixture();
  assert.equal(f.elements.revealMontageBtn.disabled,true);assert.equal(f.generated(),0);
  f.type('montageReadingInput','Mein Anfang rückt Marie ins Zentrum.');
  f.type('montageEvidenceInput','   ');f.context.renderReading();assert.equal(f.generated(),0);
  f.type('montageEvidenceInput','Karte 2: Fenster und Dialog mit Margreth, Ausgabe S. 5. Das zeigt ihren eigenen sozialen Raum.');
  assert.equal(f.elements.revealMontageBtn.disabled,false);assert.equal(f.elements.montageSuggestions.hidden,true);assert.equal(f.generated(),0);
  f.elements.revealMontageBtn.events.click();assert.equal(f.elements.montageSuggestions.hidden,false);assert.equal(f.generated(),1);
  f.type('montageRevisionInput','Ich widerspreche dem Vorschlag.');assert.equal(f.elements.montageSuggestions.hidden,false);
});
test('a different montage requires its own argument and revokes any old generated text',()=>{
  const f=fixture();f.type('montageReadingInput','Eigene Deutung');f.type('montageEvidenceInput','Textstelle und Begründung');f.elements.revealMontageBtn.events.click();
  f.context.build=[2,1];f.context.renderReading();assert.equal(f.outputs.interpretationOutput.textContent,'');
  f.events.montagechange();assert.equal(f.elements.montageSuggestions.hidden,true);assert.equal(f.elements.revealMontageBtn.disabled,true);assert.equal(f.elements.montageReadingInput.value,'');
  f.context.build=[1,2];f.events.montagechange();assert.equal(f.elements.montageReadingInput.value,'Eigene Deutung');assert.equal(f.elements.revealMontageBtn.disabled,false);assert.equal(f.elements.montageSuggestions.hidden,true);
});
test('editing the initial argument covers suggestions again and empty montages cannot unlock',()=>{
  const f=fixture();f.type('montageReadingInput','Lesart');f.type('montageEvidenceInput','Beleg');f.elements.revealMontageBtn.events.click();
  f.type('montageEvidenceInput','Ein anderer Beleg');assert.equal(f.elements.montageSuggestions.hidden,true);
  assert.equal(f.outputs.interpretationOutput.textContent,'');assert.ok(f.saved()>0);
  f.context.build=[];f.events.montagechange();assert.equal(f.elements.montageReadingInput.disabled,true);assert.equal(f.elements.revealMontageBtn.disabled,true);
});
test('backup validation preserves arguments by order and accepts older backups with no arguments',()=>{
  const f=fixture();
  const clean=value=>JSON.parse(JSON.stringify(f.context.cleanMontageArguments(value)));
  assert.deepEqual(clean(undefined),{});
  assert.deepEqual(clean({'[1,2]':{reading:'A',evidence:'Text',revision:'Einwand'},'[2,1]':{reading:'B',evidence:'Beleg'},'[]':{reading:'ignore'},'[1,1]':{reading:'ignore'},bad:{}}),{
    '[1,2]':{reading:'A',evidence:'Text',revision:'Einwand'},'[2,1]':{reading:'B',evidence:'Beleg',revision:''}
  });
});
test('portfolio exports the learners own arguments for current and saved orders, never hidden suggestions',async()=>{
  const f=fixture();let exported='';
  Object.assign(f.context,{
    journalKeys:[],journalLabels:{},journal:{},notesInput:{value:'Regieidee'},
    versions:{A:{scenes:[2,1],question:'Frage A',notes:'A'},B:{scenes:[1,2],question:'Frage B',notes:'B'}},
    transitionNotes:{},message:()=>{},downloadFile:(_name,text)=>{exported=text;},
    montageArguments:{'[1,2]':{reading:'Eigene Lesart B',evidence:'Beleg B',revision:'Einwand B'},'[2,1]':{reading:'Eigene Lesart A',evidence:'Beleg A',revision:'Einwand A'}},
  });
  f.elements.versionDifference={textContent:'Zwei Fassungen'};
  const workshop=await readFile(new URL('../public/woyzeck/workshop.js',import.meta.url),'utf8');
  const comparison=await readFile(new URL('../public/woyzeck/comparison.js',import.meta.url),'utf8');
  vm.runInContext(comparison+'\n'+workshop.slice(workshop.indexOf('function transitionLabel('),workshop.indexOf('function renderTransition('))+'\n'+workshop.slice(workshop.indexOf('function exportPortfolio(){'),workshop.indexOf("document.querySelector('#journalExportBtn')")),f.context);
  f.context.exportPortfolio();
  for(const text of ['Eigene Lesart A','Eigene Lesart B','Beleg A','Beleg B','Einwand A','Einwand B'])assert.ok(exported.includes(text),text);
  assert.ok(!exported.includes('Automatischer Vorschlag'));assert.equal(f.generated(),0);
});
