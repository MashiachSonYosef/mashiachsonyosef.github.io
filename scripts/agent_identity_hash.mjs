import crypto from 'node:crypto';

export function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function registryHash(registry) {
  const copy = JSON.parse(JSON.stringify(registry));
  delete copy.registry_hash;
  return `sha256:${crypto.createHash('sha256').update(stableStringify(copy)).digest('hex')}`;
}

export function expectedAgentIds() {
  return Array.from({ length: 14 }, (_, index) => `A${String(index + 1).padStart(2, '0')}`);
}
