export const restsOffOf = (rec, mSources, factsOf) => {
  const said = [];
  const all = Array.isArray(rec.families) ? rec.families : [];
  // a family's shelf: "" for the store, else the overlay it stands in; a source key is known on its shelf
  const shelfOf = (f) => (f.shelf === "overlay" ? String(f.overlay) : "");
  const filedOverlays = new Set(all.filter((f) => f.shelf === "overlay").map(shelfOf));
  const slot = (shelf, key) => `${shelf}\u0000${key}`;
  const filed = new Map();   // a shelf's source key -> the family that files it
  for (const f of all) for (const k of f.keys) {
    const s = slot(shelfOf(f), k);
    if (filed.has(s)) said.push(`${k} is filed by two families (${filed.get(s).id}, ${f.id})`);
    else filed.set(s, f);
  }
  // a source of the index stands on the store, or on the overlay it names; an overlay the record files no family
  // of (the span store, the piece store: packagings, not dictionaries) is never asked
  const shelfOfSource = (src) => (src && src.overlay !== undefined ? String(src.overlay) : "");
  for (const m of Object.keys(mSources)) {
    const src = mSources[m] || {}, shelf = shelfOfSource(src);
    if (shelf && !filedOverlays.has(shelf)) continue;
    if (!filed.has(slot(shelf, src.key))) said.push(shelf ? `the index's ${m} (${src.key}) is filed by no family of the overlay ${shelf}` : `the index's ${m} (${src.key}) is filed by no family of the store`);
  }
  const reads = ["id", "say", "kinds", "families", "fact", "is", "has", "stands_at", "ruling"];
  const entries = (Array.isArray(rec.rests_off) ? rec.rests_off : []).map((e) => {
    const keys = new Set();
    for (const field of Object.keys(e)) if (!reads.includes(field)) said.push(`the entry ${e.id} carries ${field}, which this rule does not read`);
    for (const k of e.kinds || []) {
      if (!rec.kinds || !rec.kinds[k]) said.push(`the entry ${e.id} names the kind ${k}, which the record does not hold`);
      for (const f of all) if (f.kind === k) for (const x of f.keys) keys.add(slot(shelfOf(f), x));
    }
    for (const id of e.families || []) {
      const f = all.find((x) => x.id === id);
      if (!f) said.push(`the entry ${e.id} names ${id}, which is no family of the record`);
      else for (const x of f.keys) keys.add(slot(shelfOf(f), x));
    }
    if (!keys.size) said.push(`the entry ${e.id} shuts no source key`);
    if ((e.is !== undefined || e.has !== undefined) && !e.fact) said.push(`the entry ${e.id} compares a value and names no fact`);
    if (e.is !== undefined && e.has !== undefined) said.push(`the entry ${e.id} reads both is and has`);
    if (e.stands_at !== undefined && (typeof e.stands_at !== "string" || !e.stands_at)) said.push(`the entry ${e.id} stands at ${JSON.stringify(e.stands_at)}, which is not the name of a fact`);
    else if (e.stands_at !== undefined && !e.fact) said.push(`the entry ${e.id} stands at the places its rows name and names no fact`);
    return { e, keys };
  });
  if (said.length) throw new Error(`the record of dictionary kinds does not hold over this index: ${said.join("; ")}`);
  const byM = new Map();   // M id -> the entries whose keys hold its source's key on its shelf, in the record's order
  return (row, place = null) => {
    if (place !== null && typeof place !== "string") throw new Error(`the rule of dictionary kinds was asked at ${JSON.stringify(place)}, which is not a place's name: refusing`);
    const m = row[3];
    const source = Object.hasOwn(mSources, m) ? mSources[m] : null;
    if (!source) return null;
    const shelf = shelfOfSource(source);
    if (shelf && !filedOverlays.has(shelf)) return null;
    let list = byM.get(m);
    if (!list) { list = entries.filter((x) => x.keys.has(slot(shelf, source.key))).map((x) => x.e); byM.set(m, list); }
    for (const e of list) {
      if (!e.fact) return e;
      const facts = factsOf(row) || {};
      const v = facts[e.fact];
      if (!(e.is !== undefined ? v === e.is : e.has !== undefined ? Array.isArray(v) && v.includes(e.has) : !!v)) continue;
      // the row stands at this place, by its own facts: the entry passes over it here
      if (place !== null && e.stands_at !== undefined && Array.isArray(facts[e.stands_at]) && facts[e.stands_at].includes(place)) continue;
      return e;
    }
    return null;
  };
};
