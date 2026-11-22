const montageReadingInput = document.querySelector('#montageReadingInput');
const montageEvidenceInput = document.querySelector('#montageEvidenceInput');
const montageRevisionInput = document.querySelector('#montageRevisionInput');
const revealMontageBtn = document.querySelector('#revealMontageBtn');
const montageSuggestions = document.querySelector('#montageSuggestions');
function updateMontageGate() {
  const key = montageArgumentKey(build);
  const ready = montageArgumentReady(build, montageArguments[key]);
  if (!ready) readingRevealedFor = null;
  const revealed = ready && readingRevealedFor === key;
  montageSuggestions.hidden = !revealed;
  revealMontageBtn.disabled = !ready;
  revealMontageBtn.setAttribute('aria-expanded',String(revealed));
  revealMontageBtn.textContent = revealed ? 'Interpretationsvorschläge wieder zudecken' : 'Interpretationsvorschläge aufdecken';
  document.querySelector('#montageGateStatus').textContent = !build.length
    ? 'Wähle zuerst Szenen für deine eigene Fassung.'
    : !ready ? 'Halte zuerst deine Deutung und begründende Textbelege für diese Szenenfolge fest.'
    : revealed ? 'Vergleiche die Vorschläge mit deinen eigenen Einträgen. Deine Deutung und Belege bleiben erhalten.'
    : 'Deutung und Textbelege sind festgehalten. Du kannst die Vorschläge jetzt als Gegenprobe aufdecken.';
  renderReading();
}
function restoreMontageArgument() {
  readingRevealedFor = null;
  const argument = montageArguments[montageArgumentKey(build)] || {};
  for (const [field,input] of [['reading',montageReadingInput],['evidence',montageEvidenceInput],['revision',montageRevisionInput]]) {
    input.value = argument[field] || '';
    input.disabled = !build.length;
  }
  updateMontageGate();
}
for (const [field,input] of [['reading',montageReadingInput],['evidence',montageEvidenceInput],['revision',montageRevisionInput]]) {
  input.addEventListener('input',()=>{
    if (!build.length) return;
    const key = montageArgumentKey(build);
    if (!montageArguments[key]) montageArguments[key] = {reading:'',evidence:'',revision:''};
    montageArguments[key][field] = input.value;
    if (field !== 'revision') readingRevealedFor = null;
    persistWorkshop();updateMontageGate();
  });
}
revealMontageBtn.addEventListener('click',()=>{
  const key = montageArgumentKey(build);
  if (!montageArgumentReady(build,montageArguments[key])) return;
  readingRevealedFor = readingRevealedFor === key ? null : key;
  updateMontageGate();
});
document.addEventListener('montagechange',restoreMontageArgument);
restoreMontageArgument();
