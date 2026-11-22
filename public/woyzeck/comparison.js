/* Compare order and adjacency separately: insertion alone is not a reordering. */
function compareMontages(a, b) {
  const commonA = a.filter(id => b.includes(id));
  const commonB = b.filter(id => a.includes(id));
  const moved = commonB.filter((id, index) => commonA.indexOf(id) !== index);
  const shifted = commonB.filter(id => !moved.includes(id) && a.indexOf(id) !== b.indexOf(id));
  const edges = sequence => Array.from({length: sequence.length + 1}, (_, index) => ({
    from: index === 0 ? null : sequence[index - 1],
    to: index === sequence.length ? null : sequence[index],
  }));
  const edgeKey = edge => `${edge.from ?? 'start'}:${edge.to ?? 'end'}`;
  const edgesA = edges(a), edgesB = edges(b);
  return {
    added: b.filter(id => !a.includes(id)),
    removed: a.filter(id => !b.includes(id)),
    moved, shifted,
    transitionsA: edgesA.map(edge => ({...edge, changed: !edgesB.some(other => edgeKey(other) === edgeKey(edge))})),
    transitionsB: edgesB.map(edge => ({...edge, changed: !edgesA.some(other => edgeKey(other) === edgeKey(edge))})),
  };
}
function montageComparisonKey(a, b) { return JSON.stringify([a, b]); }
function cleanTransitionNotes(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result = {};
  for (const [context, notes] of Object.entries(value)) {
    let pair;
    try { pair = JSON.parse(context); } catch { continue; }
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some(sequence => !Array.isArray(sequence) || sequence.length > 27 || new Set(sequence).size !== sequence.length || sequence.some(id => !Number.isInteger(id) || id < 1 || id > 27))) continue;
    if (!notes || typeof notes !== 'object' || Array.isArray(notes)) continue;
    const entries = Object.entries(notes).filter(([key, text]) => /^[AB]:(start|\d+):(end|\d+)$/.test(key) && typeof text === 'string');
    result[context] = Object.fromEntries(entries);
  }
  return result;
}
