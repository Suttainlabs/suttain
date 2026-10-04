// Exact sets of canonical path strings, not RDKit fingerprints. Stereo is ignored.
export function fingerprint(graph) {
  const features = new Set(); let visits = 0;
  const label = i => { const a = graph.atoms[i]; return `${a.element}:${a.aromatic ? 'a' : 'n'}:${a.charge}`; };
  function walk(index, tokens, seen, depth) {
    if (++visits > 60000) throw new Error('Fingerprint complexity exceeds screening limit');
    const forward = tokens.join('|'), reverse = [...tokens].reverse().join('|'); features.add(forward < reverse ? forward : reverse);
    if (depth === 5) return;
    for (const edge of graph.atoms[index].neighbors) {
      if (seen.has(edge.atom)) continue;
      seen.add(edge.atom); walk(edge.atom, [...tokens, String(edge.order), label(edge.atom)], seen, depth + 1); seen.delete(edge.atom);
    }
  }
  graph.atoms.forEach((_, i) => walk(i, [label(i)], new Set([i]), 0));
  return features;
}
export function tanimoto(a, b) {
  let intersection = 0; for (const feature of a) if (b.has(feature)) intersection++;
  const union = a.size + b.size - intersection; return union ? intersection / union : 0;
}
export function bestSimilarity(candidate, references) {
  let best = null, score = -1;
  for (const reference of references) { const similarity = tanimoto(candidate, reference.fp); if (similarity > score) { score = similarity; best = reference; } }
  return { score: Math.max(0, score), reference: best };
}