// A store that is missing a shard is a broken copy, not an empty answer (the fifth reader's finding 16).
// The store's reader took a shard file that is not there for a shard with no keys: after a partial copy every
// key of that shard read as "the catalog has no entry", and the re-gloss, the bake, the chain and the door
// wrote ordinary-looking records with about one word in 256 bare, counted as the catalog's silence. Where the
// store's own index counts all 256 shards, an absent one is refused by name.
// node 19-store-missing-shard.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "gloss-store-v1.mjs"), [
  [`  const shardCache = new Map();
  const shardBody = (name) => {
    if (!shardCache.has(name)) {
      const p = join(storeDir, "shards", \`\${name}.bin\`);
      shardCache.set(name, existsSync(p) ? JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")) : {});
    }
    return shardCache.get(name);
  };`,
   `  // A SHARD THE INDEX COUNTS AND THE DISK DOES NOT HOLD IS A BROKEN COPY.
  // A key lives in the shard named by the first two hex digits of its
  // sha256, so a store whose index counts 256 shards has every one of them.
  // Until 10 November 2026 an absent shard file was read as a shard with no
  // keys: every key of it answered "the catalog has no entry", and whatever
  // was built from that copy counted the hole as the catalog's own silence.
  // A store whose index counts fewer shards (a fixture, a store of a few
  // keys) may lack the others, and there an absent shard is an empty one.
  const everyShardCounted = ((index.counts || {}).shards === 256);
  const shardCache = new Map();
  const shardBody = (name) => {
    if (!shardCache.has(name)) {
      const p = join(storeDir, "shards", \`\${name}.bin\`);
      if (!existsSync(p) && everyShardCounted)
        throw new Error(\`the store at \${storeDir} counts 256 shards in its index and shard \${name}.bin is not here: this copy is not whole — refusing output\`);
      shardCache.set(name, existsSync(p) ? JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")) : {});
    }
    return shardCache.get(name);
  };`],
]);
