/* Coordinates refer to the unretouched, 1320 × 1969 facsimile. */
const manuscriptSpots = {
  liebling: {x:945,y:328,w:145,h:55,label:'Textspur A · Zeile 6'},
  ist: {x:739,y:382,w:77,h:54,label:'Textspur B · Zeile 7'},
  dialog: {x:48,y:452,w:1110,h:92,label:'Textspur C · Zeilen 8–9'},
};
let activeManuscript = 'liebling';
const manuscriptImage = document.querySelector('#manuscriptImage');
const manuscriptSheet = document.querySelector('#manuscriptSheet');
const manuscriptViewport = document.querySelector('#manuscriptViewport');
const manuscriptZoom = document.querySelector('#manuscriptZoom');
function focusManuscript() {
  const spot = manuscriptSpots[activeManuscript];
  manuscriptSheet.style.width = `${Number(manuscriptZoom.value)}%`;
  const mark = document.querySelector('#manuscriptMark');
  Object.assign(mark.style,{left:`${spot.x/1320*100}%`,top:`${spot.y/1969*100}%`,width:`${spot.w/1320*100}%`,height:`${spot.h/1969*100}%`});
  requestAnimationFrame(() => {
    const scale = manuscriptSheet.clientWidth / 1320;
    manuscriptViewport.scrollTo({left:(spot.x+spot.w/2)*scale-manuscriptViewport.clientWidth/2,top:(spot.y+spot.h/2)*scale-manuscriptViewport.clientHeight/2});
  });
}
document.querySelectorAll('[data-manuscript]').forEach(button => button.addEventListener('click',()=>{
  activeManuscript=button.dataset.manuscript;
  document.querySelectorAll('[data-manuscript]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button)));
  document.querySelectorAll('[data-manuscript-reading]').forEach(article=>{article.hidden=article.dataset.manuscriptReading!==activeManuscript;});
  document.querySelector('#manuscriptLive').textContent=`${manuscriptSpots[activeManuscript].label} · Zuerst selbst untersuchen`;
  manuscriptZoom.value='260';updateManuscriptGate(activeManuscript);focusManuscript();
}));
manuscriptZoom.addEventListener('change',focusManuscript);
document.querySelector('#manuscriptOverview').addEventListener('click',()=>{
  manuscriptZoom.value='100';manuscriptSheet.style.width='100%';manuscriptViewport.scrollTo({left:0,top:0});
});
manuscriptImage.addEventListener('load',focusManuscript);
manuscriptImage.addEventListener('error',()=>{
  document.querySelector('#manuscriptLive').textContent='Das Bild konnte nicht geladen werden. Öffne das verlinkte Faksimile in der Marburger Ausgabe.';
});
if (typeof ResizeObserver !== 'undefined') new ResizeObserver(()=>{
  if (!document.querySelector('#handschrift').hidden && manuscriptViewport.clientWidth) focusManuscript();
}).observe(manuscriptViewport);
if (manuscriptImage.complete) focusManuscript();

// Each text trace needs its own attempt; no correctness judgement or minimum length.
const revealedManuscripts = new Set();
function updateManuscriptGate(key) {
  const fields = [...document.querySelectorAll(`[data-manuscript-attempt="${key}"]`)];
  const ready = fields.length === 2 && fields.every(field => field.value.trim().length > 0);
  if (!ready) revealedManuscripts.delete(key);
  const revealed = ready && revealedManuscripts.has(key);
  const button = document.querySelector(`[data-manuscript-reveal="${key}"]`);
  button.disabled = !ready;
  button.setAttribute('aria-expanded', String(revealed));
  button.textContent = revealed ? 'Umschrift und Erläuterung wieder zudecken' : 'Umschrift und Erläuterung aufdecken';
  document.querySelector(`[data-manuscript-answer="${key}"]`).hidden = !revealed;
  document.querySelector(`#gate-${key}`).textContent = revealed
    ? 'Vergleiche jetzt mit deinem eigenen Versuch. Deine Einträge bleiben erhalten.'
    : ready ? 'Deine beiden Einträge sind festgehalten. Du kannst die Umschrift jetzt aufdecken.'
      : 'Notiere zuerst deinen Entzifferungsversuch und deine Vermutung. Auch Unsicherheiten kannst du festhalten.';
}
document.querySelectorAll('[data-manuscript-attempt]').forEach(field => field.addEventListener('input', () => updateManuscriptGate(field.dataset.manuscriptAttempt)));
document.querySelectorAll('[data-manuscript-reveal]').forEach(button => button.addEventListener('click', () => {
  if (button.disabled) return;
  const key = button.dataset.manuscriptReveal;
  if (revealedManuscripts.has(key)) revealedManuscripts.delete(key);
  else revealedManuscripts.add(key);
  updateManuscriptGate(key);
}));
document.addEventListener('manuscriptrestore', () => {
  revealedManuscripts.clear();
  Object.keys(manuscriptSpots).forEach(updateManuscriptGate);
});
Object.keys(manuscriptSpots).forEach(updateManuscriptGate);
