// lattice-lib-v1 · what the lattice projector and its checks share, so a
// check can import the rule and the fingerprint without running the tool
export const LATTICE_RULE_ID = "lattice-projection-rule-v1-the-lattice-is-projected-over-a-zones-own-positions-and-never-replaces-the-store";
export const SIDECAR_SCHEMA = "ZONE_LATTICE_V1";

// The fingerprint a card and a store row share: FNV-1a over the UTF-16 code
// units of "text|source", eight hex digits. The same function stands in
// zone.html; the two must agree to the character or nothing joins.
export const fnv1a = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
};
