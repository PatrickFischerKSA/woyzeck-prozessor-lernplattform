/* Learning artefacts remain local. No server, generated scoring or automatic approval. */
const journalKeys = ['question', 'hypothesis', 'evidence', 'reading', 'counter', 'peer', 'revision'];
const journalLabels = {question:'Forschungsfrage',hypothesis:'Erste Vermutung',evidence:'Beobachtung am Text',reading:'Meine Deutung',counter:'Gegenbeleg / andere Lesart',peer:'Rückmeldung aus dem Gespräch',revision:'Revidierte These'};
function cleanJournal(value) {
  return Object.fromEntries(journalKeys.map(key => [key, typeof value?.[key] === 'string' ? value[key] : '']));
}
function cleanVersion(value) {
  if (!value || !Array.isArray(value.scenes) || value.scenes.some(id => !Number.isInteger(id) || !sceneById(id)) || new Set(value.scenes).size !== value.scenes.length) return null;
  return {scenes:[...value.scenes], notes:typeof value.notes === 'string' ? value.notes : '', question:typeof value.question === 'string' ? value.question : '', savedAt:typeof value.savedAt === 'string' && !Number.isNaN(Date.parse(value.savedAt)) ? value.savedAt : new Date().toISOString()};
}
let journal = cleanJournal(readStored('woyzeckJournal', {}));
let versions = readStored('woyzeckVersions', {});
versions = {A:cleanVersion(versions?.A), B:cleanVersion(versions?.B)};
let toastTimer;
function message(text) {
  const output = document.querySelector('#workshopMessage');
  output.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { output.textContent = ''; }, 5000);
}
function persistWorkshop() {
  try {
    localStorage.setItem('woyzeckJournal',JSON.stringify(journal));
    localStorage.setItem('woyzeckVersions',JSON.stringify(versions));
    document.querySelector('#saveStatus').textContent = 'Lokal in diesem Browser gespeichert';
  } catch {
    document.querySelector('#saveStatus').textContent = 'Speichern nicht möglich – bitte exportieren';
    message('Der Browser kann nicht speichern. Lade eine Sicherung herunter.');
  }
}
function showView() {
  const hash = location.hash.slice(1);
  const aliases = {material:'werkstatt',montage:'werkstatt',textlabor:'perspektiven',opfer:'perspektiven',vergleich:'perspektiven',figuren:'perspektiven'};
  const selected = aliases[hash] || (['auftakt','werkstatt','perspektiven','protokoll'].includes(hash) ? hash : 'auftakt');
  document.querySelectorAll('.view').forEach(view => {view.hidden = view.id !== selected;});
  document.querySelectorAll('[data-view]').forEach(link => {
    if(link.dataset.view === selected) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  if (hash === 'vergleich') document.querySelector('#otherWorks').open = true;
  if (hash === 'figuren') document.querySelector('#figuren').open = true;
  if (aliases[hash]) document.getElementById(hash)?.scrollIntoView({block:'start'});
  else window.scrollTo(0,0);
}
window.addEventListener('hashchange',showView);
showView();
function syncQuestion() {
  document.querySelector('#currentQuestion').textContent = journal.question.trim() || 'Was verändert sich durch meine Szenenfolge?';
}
function restoreJournalFields() {
  document.querySelectorAll('[data-journal]').forEach(input => {input.value = journal[input.dataset.journal] || '';});
  syncQuestion();
}
restoreJournalFields();
document.querySelectorAll('[data-journal]').forEach(input => input.addEventListener('input',() => {
  journal[input.dataset.journal] = input.value;
  syncQuestion();persistWorkshop();
}));
document.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click',() => {
  journal.question = button.dataset.question;
  restoreJournalFields();persistWorkshop();document.querySelector('#inquiryInput').focus();
}));
function renderVersions() {
  const container = document.querySelector('#versionComparison');
  container.replaceChildren();
  ['A','B'].forEach(key => {
    const version = versions[key];
    const card = document.createElement('article');card.className = 'version-card';
    const heading = document.createElement('h3');heading.textContent = `Fassung ${key}`;card.append(heading);
    if(!version){const p = document.createElement('p');p.textContent = key === 'A' ? 'Dein erster Entwurf. In der Werkstatt als A sichern.' : 'Dein veränderter Entwurf. In der Werkstatt als B sichern.';card.append(p);}
    else {
      const time = document.createElement('time');time.dateTime=version.savedAt;time.textContent=new Date(version.savedAt).toLocaleString('de-CH');card.append(time);
      if(version.question){const q=document.createElement('p');q.textContent=version.question;card.append(q);}
      const list = document.createElement('ol');version.scenes.forEach(id => {const li=document.createElement('li');li.textContent=`${id}. ${sceneById(id).title}`;list.append(li);});card.append(list);
      if(version.notes){const notes=document.createElement('blockquote');notes.textContent=version.notes;card.append(notes);}
      const load=document.createElement('button');load.textContent=`Fassung ${key} laden`;load.type='button';
      load.addEventListener('click',() => {
        if(!confirm(`Fassung ${key} laden? Sie ersetzt deine aktuelle Montage und Regiebegründung. Sichere den aktuellen Entwurf bei Bedarf zuerst als A oder B.`)) return;
        build=[...version.scenes];notesInput.value=version.notes;
        localStorage.setItem('woyzeckNotes',version.notes);saveBuild();renderBuild();location.hash='werkstatt';message(`Fassung ${key} geladen.`);
      });card.append(load);
    }
    container.append(card);
  });
  const a=versions.A?.scenes,b=versions.B?.scenes;
  let difference='Sichere zwei Fassungen, um die Veränderung deiner Anordnung sichtbar zu machen.';
  if(a&&b){
    const added=b.filter(id=>!a.includes(id));const removed=a.filter(id=>!b.includes(id));
    const moved=b.filter(id=>a.includes(id)&&a.indexOf(id)!==b.indexOf(id));
    if(!added.length&&!removed.length&&!moved.length) difference='A und B haben dieselbe Szenenfolge. Welche andere Anordnung könnte deine Vermutung herausfordern?';
    else difference=`Von A zu B: ${added.length} Szene(n) hinzugefügt, ${removed.length} weggelassen, ${moved.length} gemeinsame Szene(n) an anderer Position. Welche Änderung verändert deine Lesart am stärksten?`;
  }
  document.querySelector('#versionDifference').textContent=difference;
}
function saveVersion(key) {
  if(!build.length){message('Wähle zuerst mindestens eine Szene für deine Fassung.');return;}
  if(versions[key]&&!confirm(`Gesicherte Fassung ${key} durch deine aktuelle Montage ersetzen?`)) return;
  versions[key]={scenes:[...build],notes:notesInput.value,question:journal.question,savedAt:new Date().toISOString()};
  persistWorkshop();renderVersions();message(`Fassung ${key} gesichert. Du kannst jetzt deine Montage verändern.`);
}
document.querySelector('#saveABtn').addEventListener('click',()=>saveVersion('A'));
document.querySelector('#saveBBtn').addEventListener('click',()=>saveVersion('B'));
function updateCount(){document.querySelector('#navBuildCount').textContent=String(build.length);}
document.addEventListener('montagechange',updateCount);updateCount();renderVersions();
function downloadFile(name,content,type){
  const url=URL.createObjectURL(new Blob([content],{type}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportPortfolio(){
  const lines=['WOYZECK · MEINE MONTAGEWERKSTATT',new Date().toLocaleString('de-CH'),'Textgrundlage: https://buechnerportal.de/werke/woyzeck/','Karten sind didaktische Paraphrasen; Nummern bezeichnen keine autorisierte Szenenfolge.',''];
  journalKeys.forEach(key=>lines.push(journalLabels[key],journal[key]||'Noch offen',''));
  const sequence=(title,ids,notes)=>{lines.push(title,...ids.map((id,i)=>`${i+1}. Karte ${id}: ${sceneById(id).title}`),'Regieidee / Begründung:',notes||'Noch offen','');};
  sequence('Aktuelle Montage',build,notesInput.value);
  ['A','B'].forEach(key=>{if(versions[key]){lines.push(`Forschungsfrage ${key}: ${versions[key].question||'Noch offen'}`);sequence(`Gesicherte Fassung ${key}`,versions[key].scenes,versions[key].notes);}});
  lines.push(document.querySelector('#versionDifference').textContent);
  downloadFile('woyzeck-denkprotokoll.txt',lines.join('\n'),'text/plain;charset=utf-8');message('Denkprotokoll exportiert.');
}
document.querySelector('#journalExportBtn').addEventListener('click',exportPortfolio);
document.querySelector('#backupBtn').addEventListener('click',()=>{
  downloadFile('woyzeck-sicherung.json',JSON.stringify({format:'woyzeck-workshop-v1',journal,versions,build,notes:notesInput.value},null,2),'application/json');message('Sicherung heruntergeladen.');
});
document.querySelector('#restoreInput').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try{
    if(file.size>2000000)throw Error('Zu grosse Datei');
    const data=JSON.parse(await file.text());
    if(data.format!=='woyzeck-workshop-v1'||!Array.isArray(data.build)||data.build.length>27||data.build.some(id=>!Number.isInteger(id)||!sceneById(id))||new Set(data.build).size!==data.build.length||!data.journal||!data.versions||typeof data.notes!=='string')throw Error('Ungültiges Format');
    const nextVersions={A:cleanVersion(data.versions.A),B:cleanVersion(data.versions.B)};
    if((data.versions.A&&!nextVersions.A)||(data.versions.B&&!nextVersions.B))throw Error('Ungültige Fassungen');
    if(!confirm('Diese Sicherung ersetzt dein Denkprotokoll, deine Fassungen A und B und die aktuelle Montage. Fortfahren?'))return;
    journal=cleanJournal(data.journal);versions=nextVersions;build=[...data.build];notesInput.value=data.notes;
    localStorage.setItem('woyzeckNotes',data.notes);saveBuild();persistWorkshop();restoreJournalFields();renderBuild();renderVersions();message('Sicherung eingelesen.');
  }catch{message('Diese Datei ist keine gültige Woyzeck-Sicherung. Dein Arbeitsstand bleibt erhalten.');}
  finally{event.target.value='';}
});
// Print the full text of fields instead of clipped textarea viewports.
window.addEventListener('beforeprint',()=>{
  document.querySelectorAll('textarea').forEach(field=>{const p=document.createElement('div');p.className='print-value';p.textContent=field.value||'Noch offen';field.after(p);});
});
window.addEventListener('afterprint',()=>document.querySelectorAll('.print-value').forEach(node=>node.remove()));
