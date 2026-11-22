/* Arguments belong to an exact scene order, independently of suggestion visibility. */
function montageArgumentKey(sequence) { return JSON.stringify(sequence); }
function cleanMontageArguments(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result = {};
  for (const [key, argument] of Object.entries(value)) {
    let sequence;
    try { sequence = JSON.parse(key); } catch { continue; }
    if (!Array.isArray(sequence) || !sequence.length || sequence.length > 27 || new Set(sequence).size !== sequence.length || sequence.some(id => !Number.isInteger(id) || id < 1 || id > 27)) continue;
    if (!argument || typeof argument !== 'object' || Array.isArray(argument)) continue;
    result[montageArgumentKey(sequence)] = Object.fromEntries(['reading','evidence','revision'].map(field => [field, typeof argument[field] === 'string' ? argument[field] : '']));
  }
  return result;
}
function montageArgumentReady(sequence, argument) {
  return sequence.length > 0 && typeof argument?.reading === 'string' && argument.reading.trim().length > 0 && typeof argument?.evidence === 'string' && argument.evidence.trim().length > 0;
}
