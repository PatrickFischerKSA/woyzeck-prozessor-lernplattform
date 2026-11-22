/* Coordinates refer to the unretouched, 1320 × 1969 facsimile. */
const manuscriptSpots = {
  liebling: {x:945,y:328,w:145,h:55,label:'„Liebling“ gestrichen · Zeile 6'},
  ist: {x:739,y:382,w:77,h:54,label:'„Ist“ gestrichen · Zeile 7'},
  dialog: {x:48,y:452,w:1110,h:92,label:'Dialog nachgetragen · Zeilen 8–9'},
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
  document.querySelector('#manuscriptLive').textContent=`Textspur: ${manuscriptSpots[activeManuscript].label}`;
  manuscriptZoom.value='260';focusManuscript();
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
  if (!document.querySelector('#auftakt').hidden && manuscriptViewport.clientWidth) focusManuscript();
}).observe(manuscriptViewport);
if (manuscriptImage.complete) focusManuscript();
