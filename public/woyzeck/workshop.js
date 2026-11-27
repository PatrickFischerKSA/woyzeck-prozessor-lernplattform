/* Learning artefacts remain local. No server, generated scoring or automatic approval. */
const journalKeys = ['question', 'hypothesis', 'entryObservation', 'historicalCaseObservation', 'peasObservation', 'manuscriptObservation', 'manuscriptLieblingReading', 'manuscriptLieblingHypothesis', 'manuscriptLieblingRevision', 'manuscriptIstReading', 'manuscriptIstHypothesis', 'manuscriptIstRevision', 'manuscriptDialogReading', 'manuscriptDialogHypothesis', 'manuscriptDialogRevision', 'evidence', 'reading', 'counter', 'peer', 'revision'];
const journalLabels = {question:'Frage an den Text',hypothesis:'Erste Vermutung',entryObservation:'Beobachtungen zur Leseprobe',historicalCaseObservation:'Quellenvergleich: historischer Woyzeck und Dramenfigur',peasObservation:'Erbsendiät: Deutung, Belege und Montage',manuscriptObservation:'Beobachtungen an der Originalhandschrift','manuscriptLieblingReading':'Textspur A: Entzifferungsversuch','manuscriptLieblingHypothesis':'Textspur A: Vermutung zur Überarbeitung','manuscriptLieblingRevision':'Textspur A: Vergleich nach dem Aufdecken','manuscriptIstReading':'Textspur B: Entzifferungsversuch','manuscriptIstHypothesis':'Textspur B: Vermutung zur Überarbeitung','manuscriptIstRevision':'Textspur B: Vergleich nach dem Aufdecken','manuscriptDialogReading':'Textspur C: Entzifferungsversuch','manuscriptDialogHypothesis':'Textspur C: Vermutung zur Überarbeitung','manuscriptDialogRevision':'Textspur C: Vergleich nach dem Aufdecken',evidence:'Beobachtung am Text',reading:'Meine Deutung',counter:'Gegenbeleg / andere Lesart',peer:'Rückmeldung aus dem Gespräch',revision:'Was ich jetzt anders sehe'};
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
let transitionNotes = cleanTransitionNotes(readStored('woyzeckTransitionNotes', {}));
let montageArguments = cleanMontageArguments(readStored('woyzeckMontageArguments', {}));
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
    localStorage.setItem('woyzeckTransitionNotes',JSON.stringify(transitionNotes));
    localStorage.setItem('woyzeckMontageArguments',JSON.stringify(montageArguments));
    document.querySelector('#saveStatus').textContent = 'Lokal in diesem Browser gespeichert';
  } catch {
    document.querySelector('#saveStatus').textContent = 'Speichern nicht möglich – bitte exportieren';
    message('Der Browser kann nicht speichern. Lade eine Sicherung herunter.');
  }
}
function showView(event) {
  const hash = location.hash.slice(1);
  const aliases = {material:'werkstatt',montage:'werkstatt',textlabor:'perspektiven',opfer:'perspektiven',vergleich:'perspektiven',figuren:'perspektiven'};
  const views = [...document.querySelectorAll('.view')];
  const selected = aliases[hash] || (views.some(view => view.id === hash) ? hash : 'auftakt');
  const active = views.find(view => view.id === selected);
  views.forEach(view => {
    view.hidden = view !== active;
    if (view.hidden) view.querySelectorAll('video').forEach(video => video.pause());
  });
  document.querySelectorAll('[data-view]').forEach(link => {
    if(link.dataset.view === selected) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  const currentLink = document.querySelector(`[data-view="${selected}"]`);
  document.querySelector('#mobileUnitName').textContent = currentLink.dataset.unitName;
  if (selected === 'protokoll') renderVersions();
  if (hash === 'figuren') document.querySelector('#figuren').open = true;
  if (event && window.matchMedia('(max-width:850px)').matches) document.querySelector('#unitMenu').open = false;
  if (aliases[hash]) document.getElementById(hash)?.scrollIntoView({block:'start'});
  else window.scrollTo(0,0);
  if (event) {active.setAttribute('tabindex','-1');active.focus({preventScroll:true});}
}
window.addEventListener('hashchange',showView);
const unitMenu = document.querySelector('#unitMenu');
unitMenu.open = !window.matchMedia('(max-width:850px)').matches;
window.matchMedia('(max-width:850px)').addEventListener('change',event => {unitMenu.open = !event.matches;});
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
  const a = versions.A?.scenes, b = versions.B?.scenes;
  const comparison = a && b ? compareMontages(a, b) : null;
  const context = comparison ? montageComparisonKey(a, b) : null;
  ['A','B'].forEach(key => {
    const version = versions[key];
    const card = document.createElement('article');card.className = 'version-card';
    const heading = document.createElement('h3');heading.textContent = `Fassung ${key}`;card.append(heading);
    if(!version){const p = document.createElement('p');p.textContent = key === 'A' ? 'Dein erster Entwurf. In der Werkstatt als A sichern.' : 'Dein veränderter Entwurf. In der Werkstatt als B sichern.';card.append(p);}
    else {
      const time = document.createElement('time');time.dateTime=version.savedAt;time.textContent=new Date(version.savedAt).toLocaleString('de-CH');card.append(time);
      if(version.question){const q=document.createElement('p');q.textContent=version.question;card.append(q);}
      const list = document.createElement('ol');
      list.className = 'comparison-scenes';
      version.scenes.forEach((id, index) => {
        const li = document.createElement('li');
        if (comparison) li.append(renderTransition(comparison[`transitions${key}`][index], key, context));
        const scene = document.createElement('div');scene.className = 'comparison-scene';
        const position = document.createElement('span');position.className = 'comparison-position';position.textContent = `${key}${index + 1}`;
        const title = document.createElement('strong');title.textContent = `Karte ${id} · ${sceneById(id).title}`;
        scene.append(position, title);
        if (comparison) {
          let status = '', kind = '';
          if (comparison.moved.includes(id)) {status = `Verschoben · A${a.indexOf(id) + 1} / B${b.indexOf(id) + 1}`;kind = 'moved';}
          else if (comparison.shifted.includes(id)) {status = `Position gerückt · A${a.indexOf(id) + 1} / B${b.indexOf(id) + 1}`;kind = 'shifted';}
          else if (comparison.added.includes(id)) {status = 'Nur in B · hinzugefügt';kind = 'added';}
          else if (comparison.removed.includes(id)) {status = 'Nur in A · weggelassen';kind = 'removed';}
          else {status = 'Gleiche Position';kind = 'unchanged';}
          scene.classList.add(`scene-${kind}`);
          const badge = document.createElement('span');badge.className = 'scene-change';badge.textContent = status;scene.append(badge);
        }
        li.append(scene);list.append(li);
      });
      card.append(list);
      if (comparison) card.append(renderTransition(comparison[`transitions${key}`].at(-1), key, context));
      if(version.notes){const notes=document.createElement('blockquote');notes.textContent=version.notes;card.append(notes);}
      const argument = montageArguments[montageArgumentKey(version.scenes)];
      if (argument) {
        for (const [field, label] of [['reading','Eigene Deutung'],['evidence','Textbelege und Begründung'],['revision','Vergleich mit Vorschlägen']]) {
          if (!argument[field]) continue;
          const caption = document.createElement('strong');caption.textContent = label;
          const text = document.createElement('p');text.textContent = argument[field];
          card.append(caption, text);
        }
      }
      const load=document.createElement('button');load.textContent=`Fassung ${key} laden`;load.type='button';
      load.addEventListener('click',() => {
        if(!confirm(`Fassung ${key} laden? Sie ersetzt deine aktuelle Szenenfolge und die Notizen dazu. Sichere den aktuellen Entwurf bei Bedarf zuerst als A oder B.`)) return;
        build=[...version.scenes];notesInput.value=version.notes;
        localStorage.setItem('woyzeckNotes',version.notes);saveBuild();renderBuild();location.hash='werkstatt';message(`Fassung ${key} geladen.`);
      });card.append(load);
    }
    container.append(card);
  });
  let difference='Sichere zwei Fassungen, um die Veränderung deiner Anordnung sichtbar zu machen.';
  if(a&&b){
    const {added, removed, moved, shifted} = comparison;
    if(!added.length&&!removed.length&&!moved.length) difference='A und B haben dieselbe Szenenfolge. Welche andere Anordnung könnte deine Vermutung herausfordern?';
    else difference=`Von A zu B: ${added.length} Szene(n) hinzugefügt, ${removed.length} weggelassen, ${moved.length} Szene(n) umgeordnet, ${shifted.length} nur in der Positionsnummer gerückt. Begründe die veränderte Wirkung direkt an den markierten Übergängen.`;
  }
  document.querySelector('#versionDifference').textContent=difference;
}
function transitionLabel(edge) {
  const name = id => `Karte ${id} · ${sceneById(id).title}`;
  if (edge.from === null) return `Anfang: ${edge.to === null ? 'leere Fassung' : name(edge.to)}`;
  if (edge.to === null) return `Schluss nach ${name(edge.from)}`;
  return `${name(edge.from)} → ${name(edge.to)}`;
}
function renderTransition(edge, side, context) {
  const block = document.createElement('div');
  block.className = `comparison-transition${edge.changed ? ' transition-changed' : ''}`;
  if (!edge.changed) {
    const hint = document.createElement('span');hint.textContent = edge.from === null ? 'Gleicher Anfang' : edge.to === null ? 'Gleicher Schluss' : 'Übergang unverändert';block.append(hint);return block;
  }
  const tag = document.createElement('strong');tag.className = 'transition-tag';
  tag.textContent = side === 'A' ? 'In B entfallen' : 'In B neu';
  const description = document.createElement('p');description.textContent = transitionLabel(edge);
  const label = document.createElement('label');
  const caption = document.createElement('span');caption.textContent = side === 'A' ? 'Wie hängen diese Szenen für dich in A zusammen?' : 'Was verstehst du in B anders als in A?';
  const input = document.createElement('textarea');input.rows = 3;
  const noteKey = `${side}:${edge.from ?? 'start'}:${edge.to ?? 'end'}`;
  input.value = transitionNotes[context]?.[noteKey] || '';
  input.setAttribute('aria-label', `Fassung ${side}, ${transitionLabel(edge)}: Begründung`);
  input.placeholder = side === 'A' ? 'In A erwarte oder vermute ich …, weil … Textbeleg: …' : 'Gegenüber A erscheint … jetzt …, weil … Textbeleg: …';
  input.addEventListener('input', () => {
    if (!transitionNotes[context]) transitionNotes[context] = {};
    transitionNotes[context][noteKey] = input.value;persistWorkshop();
  });
  label.append(caption, input);block.append(tag, description, label);return block;
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
  const sequence=(title,ids,notes)=>{
    lines.push(title,...ids.map((id,i)=>`${i+1}. Karte ${id}: ${sceneById(id).title}`),'Regieidee / Begründung:',notes||'Noch offen','');
    const argument=montageArguments[montageArgumentKey(ids)];
    for (const [field,label] of [['reading','Eigene Deutung dieser Szenenfolge'],['evidence','Textbelege und Begründung'],['revision','Vergleich mit Interpretationsvorschlägen']]) lines.push(label,argument?.[field]||'Noch offen','');
  };
  sequence('Aktuelle Montage',build,notesInput.value);
  ['A','B'].forEach(key=>{if(versions[key]){lines.push(`Frage an den Text ${key}: ${versions[key].question||'Noch offen'}`);sequence(`Gesicherte Fassung ${key}`,versions[key].scenes,versions[key].notes);}});
  lines.push(document.querySelector('#versionDifference').textContent);
  if (versions.A && versions.B) {
    const comparison = compareMontages(versions.A.scenes, versions.B.scenes);
    const context = montageComparisonKey(versions.A.scenes, versions.B.scenes);
    lines.push('', 'BEGRÜNDUNGEN AN DEN VERÄNDERTEN ÜBERGÄNGEN');
    ['A','B'].forEach(side => comparison[`transitions${side}`].filter(edge => edge.changed).forEach(edge => {
      const key = `${side}:${edge.from ?? 'start'}:${edge.to ?? 'end'}`;
      lines.push(`Fassung ${side}: ${transitionLabel(edge)}`, transitionNotes[context]?.[key] || 'Noch offen', '');
    }));
  }
  downloadFile('woyzeck-notizen.txt',lines.join('\n'),'text/plain;charset=utf-8');message('Notizen heruntergeladen.');
}
document.querySelector('#journalExportBtn').addEventListener('click',exportPortfolio);
document.querySelector('#backupBtn').addEventListener('click',()=>{
  downloadFile('woyzeck-sicherung.json',JSON.stringify({format:'woyzeck-workshop-v1',journal,versions,transitionNotes,montageArguments,build,notes:notesInput.value},null,2),'application/json');message('Sicherung heruntergeladen.');
});
document.querySelector('#restoreInput').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try{
    if(file.size>2000000)throw Error('Zu grosse Datei');
    const data=JSON.parse(await file.text());
    if(data.format!=='woyzeck-workshop-v1'||!Array.isArray(data.build)||data.build.length>27||data.build.some(id=>!Number.isInteger(id)||!sceneById(id))||new Set(data.build).size!==data.build.length||!data.journal||!data.versions||typeof data.notes!=='string')throw Error('Ungültiges Format');
    const nextVersions={A:cleanVersion(data.versions.A),B:cleanVersion(data.versions.B)};
    if((data.versions.A&&!nextVersions.A)||(data.versions.B&&!nextVersions.B))throw Error('Ungültige Fassungen');
    if(!confirm('Diese Sicherung ersetzt deine Notizen, deine Fassungen A und B und die aktuelle Montage. Fortfahren?'))return;
    journal=cleanJournal(data.journal);versions=nextVersions;transitionNotes=cleanTransitionNotes(data.transitionNotes);montageArguments=cleanMontageArguments(data.montageArguments);readingRevealedFor=null;build=[...data.build];notesInput.value=data.notes;
    localStorage.setItem('woyzeckNotes',data.notes);saveBuild();persistWorkshop();restoreJournalFields();renderBuild();renderVersions();document.dispatchEvent(new Event("manuscriptrestore"));message('Sicherung eingelesen.');
  }catch{message('Diese Datei ist keine gültige Woyzeck-Sicherung. Dein Arbeitsstand bleibt erhalten.');}
  finally{event.target.value='';}
});
// Print the full text of fields instead of clipped textarea viewports.
window.addEventListener('beforeprint',()=>{
  document.querySelectorAll('textarea').forEach(field=>{const p=document.createElement('div');p.className='print-value';p.textContent=field.value||'Noch offen';field.after(p);});
});
window.addEventListener('afterprint',()=>document.querySelectorAll('.print-value').forEach(node=>node.remove()));
