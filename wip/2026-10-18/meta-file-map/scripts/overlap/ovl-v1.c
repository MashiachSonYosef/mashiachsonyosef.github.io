/* ovl: measure line-level (L2) and chunk-level (L3) overlap of a stream of files, and compress the unique
 * store (L4). Read-only on its input; writes only the files named by --out.
 *
 * Input protocol on stdin (written by the Python driver 20-drive.py):
 *   'F' kind(1 byte: 'T' text -> line + chunk, 'B' binary -> chunk only) u16 namelen, name bytes
 *   'D' u32 len, len bytes     (any number)
 *   'E'                        end of the current file
 *   'Q'                        quit (dump tables and totals)
 * Per file it writes one line to <out>.files.tsv; at the end <out>.totals.tsv and the sorted unique-unit tables
 * <out>.line.tab and <out>.cdc.tab (records of u64 hash, u32 len, u32 zero; sorted by hash) for global merges.
 *
 * Content-defined chunking: gear rolling hash h = (h << 1) + G[byte] (64-bit), boundary when the top AVG_BITS
 * bits of h are zero, never before MIN bytes, always at MAX bytes. Defaults MIN 8 KiB, AVG_BITS 16, MAX 256 KiB.
 * Unit identity: MurmurHash64A of the unit bytes plus its length (64-bit; collisions are negligible at these
 * counts, about 1e-7 for 1e6 units).
 * Recipe cost: for every file, the number of extents = maximal runs of units whose store sequence numbers are
 * consecutive (a version that shares long runs with its predecessor costs one extent per run).
 * L4: each mode's unique units, in first-seen order, are fed to zlib level 6 (all of it) and to xz preset 6
 * (the first XZCAP bytes); zlib is also run over the same capped prefix so the xz/zlib ratio is like for like.
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <zlib.h>
#include <lzma.h>

static uint64_t murmur64a(const void *key, size_t len, uint64_t seed) {
  const uint64_t m = 0xc6a4a7935bd1e995ULL; const int r = 47;
  uint64_t h = seed ^ (len * m);
  const unsigned char *p = (const unsigned char *)key; size_t n = len / 8;
  for (size_t i = 0; i < n; i++) { uint64_t k; memcpy(&k, p + 8 * i, 8); k *= m; k ^= k >> r; k *= m; h ^= k; h *= m; }
  const unsigned char *t = p + 8 * n;
  switch (len & 7) {
    case 7: h ^= (uint64_t)t[6] << 48; /* fallthrough */
    case 6: h ^= (uint64_t)t[5] << 40; /* fallthrough */
    case 5: h ^= (uint64_t)t[4] << 32; /* fallthrough */
    case 4: h ^= (uint64_t)t[3] << 24; /* fallthrough */
    case 3: h ^= (uint64_t)t[2] << 16; /* fallthrough */
    case 2: h ^= (uint64_t)t[1] << 8; /* fallthrough */
    case 1: h ^= (uint64_t)t[0]; h *= m;
  }
  h ^= h >> r; h *= m; h ^= h >> r;
  return h;
}

/* open-addressing table: key (0 = empty), len, seq */
typedef struct { uint64_t k; uint32_t len; uint32_t seq; } ent;
typedef struct { ent *e; uint64_t cap, n; } table;
static void t_init(table *t, uint64_t cap) { t->cap = cap; t->n = 0; t->e = calloc(cap, sizeof(ent)); if (!t->e) { fprintf(stderr, "oom\n"); exit(3); } }
static ent *t_find(table *t, uint64_t k, int *isnew) {
  uint64_t i = (k * 0x9E3779B97F4A7C15ULL) & (t->cap - 1);
  for (;;) {
    ent *x = &t->e[i];
    if (x->k == 0) { *isnew = 1; x->k = k; t->n++; return x; }
    if (x->k == k) { *isnew = 0; return x; }
    i = (i + 1) & (t->cap - 1);
  }
}
static void t_grow(table *t) {
  table nt; t_init(&nt, t->cap * 2); int dummy;
  for (uint64_t i = 0; i < t->cap; i++) if (t->e[i].k) { ent *x = t_find(&nt, t->e[i].k, &dummy); x->len = t->e[i].len; x->seq = t->e[i].seq; }
  free(t->e); *t = nt;
}

typedef struct {
  z_stream z, zc; lzma_stream x; int xon;
  uint64_t in, zout, xin, xout, zcout, cap;
  unsigned char buf[1 << 16];
} comp;
static void c_init(comp *c, uint64_t cap) {
  memset(&c->z, 0, sizeof c->z); deflateInit(&c->z, 6);
  memset(&c->zc, 0, sizeof c->zc); deflateInit(&c->zc, 6);
  lzma_stream tmp = LZMA_STREAM_INIT; c->x = tmp;
  if (lzma_easy_encoder(&c->x, 6, LZMA_CHECK_CRC64) != LZMA_OK) { fprintf(stderr, "lzma init\n"); exit(3); }
  c->xon = 1; c->in = c->zout = c->xin = c->xout = c->zcout = 0; c->cap = cap;
}
static void z_feed(z_stream *z, const unsigned char *p, size_t n, int flush, uint64_t *out, unsigned char *buf) {
  z->next_in = (unsigned char *)p; z->avail_in = (uInt)n;
  do { z->next_out = buf; z->avail_out = sizeof(((comp *)0)->buf); deflate(z, flush); *out += sizeof(((comp *)0)->buf) - z->avail_out; }
  while (z->avail_out == 0 || (flush == Z_FINISH && z->avail_in) );
}
static void x_feed(comp *c, const unsigned char *p, size_t n, lzma_action a) {
  c->x.next_in = p; c->x.avail_in = n;
  for (;;) {
    c->x.next_out = c->buf; c->x.avail_out = sizeof c->buf;
    lzma_ret r = lzma_code(&c->x, a);
    c->xout += sizeof c->buf - c->x.avail_out;
    if (a == LZMA_FINISH) { if (r == LZMA_STREAM_END) break; }
    else if (c->x.avail_in == 0 && c->x.avail_out != 0) break;
  }
}
static void c_feed(comp *c, const unsigned char *p, size_t n) {
  c->in += n;
  z_feed(&c->z, p, n, Z_NO_FLUSH, &c->zout, c->buf);
  if (c->xon) {
    size_t take = n; if (c->xin + take > c->cap) take = c->cap - c->xin;
    if (take) { x_feed(c, p, take, LZMA_RUN); z_feed(&c->zc, p, take, Z_NO_FLUSH, &c->zcout, c->buf); c->xin += take; }
    if (c->xin >= c->cap) { x_feed(c, NULL, 0, LZMA_FINISH); z_feed(&c->zc, NULL, 0, Z_FINISH, &c->zcout, c->buf); c->xon = 0; }
  }
}
static void c_end(comp *c) {
  z_feed(&c->z, NULL, 0, Z_FINISH, &c->zout, c->buf);
  if (c->xon) { x_feed(c, NULL, 0, LZMA_FINISH); z_feed(&c->zc, NULL, 0, Z_FINISH, &c->zcout, c->buf); c->xon = 0; }
}

typedef struct {
  table t; comp c; uint64_t seq;
  /* totals */
  uint64_t units, bytes, nunits, nbytes, extents, files;
  /* per file */
  uint64_t f_units, f_bytes, f_nunits, f_nbytes, f_ext; int64_t lastseq;
} mode;
static void m_init(mode *m, uint64_t cap) { memset(m, 0, sizeof *m); t_init(&m->t, 1 << 20); c_init(&m->c, cap); }
static void m_file_start(mode *m) { m->f_units = m->f_bytes = m->f_nunits = m->f_nbytes = m->f_ext = 0; m->lastseq = -2; }
static void m_unit(mode *m, const unsigned char *p, size_t n, uint64_t seed) {
  if (m->t.n * 10 > m->t.cap * 6) t_grow(&m->t);
  uint64_t k = murmur64a(p, n, seed) ^ ((uint64_t)n * 0x9E3779B97F4A7C15ULL); if (!k) k = 1;
  int isnew; ent *x = t_find(&m->t, k, &isnew);
  if (isnew) { x->len = (uint32_t)(n > 0xffffffffULL ? 0xffffffffULL : n); x->seq = (uint32_t)m->seq++; m->f_nunits++; m->f_nbytes += n; c_feed(&m->c, p, n); }
  if ((int64_t)x->seq != m->lastseq + 1) m->f_ext++;
  m->lastseq = x->seq; m->f_units++; m->f_bytes += n;
}
static void m_file_end(mode *m) {
  m->units += m->f_units; m->bytes += m->f_bytes; m->nunits += m->f_nunits; m->nbytes += m->f_nbytes; m->extents += m->f_ext; m->files++;
}
static int cmpent(const void *a, const void *b) { uint64_t x = ((const ent *)a)->k, y = ((const ent *)b)->k; return x < y ? -1 : x > y; }
static void m_dump(mode *m, const char *path) {
  uint64_t j = 0; for (uint64_t i = 0; i < m->t.cap; i++) if (m->t.e[i].k) m->t.e[j++] = m->t.e[i];
  qsort(m->t.e, j, sizeof(ent), cmpent);
  FILE *f = fopen(path, "wb"); for (uint64_t i = 0; i < j; i++) { m->t.e[i].seq = 0; fwrite(&m->t.e[i], sizeof(ent), 1, f); } fclose(f);
}

static uint64_t G[256];
static size_t MIN = 8192, MAX = 262144; static int AVGB = 16;

static unsigned char *lbuf; static size_t lcap, llen;     /* current partial line */
static unsigned char *cbuf; static size_t clen; static uint64_t gh; /* current chunk */

static void rd(void *p, size_t n) { if (fread(p, 1, n, stdin) != n) { fprintf(stderr, "short read\n"); exit(4); } }

int main(int argc, char **argv) {
  const char *out = NULL; uint64_t xzcap = 256ULL << 20;
  for (int i = 1; i < argc; i++) {
    if (!strcmp(argv[i], "--out")) out = argv[++i];
    else if (!strcmp(argv[i], "--xzcap")) xzcap = strtoull(argv[++i], 0, 10);
    else if (!strcmp(argv[i], "--min")) MIN = strtoull(argv[++i], 0, 10);
    else if (!strcmp(argv[i], "--max")) MAX = strtoull(argv[++i], 0, 10);
    else if (!strcmp(argv[i], "--avgbits")) AVGB = atoi(argv[++i]);
  }
  if (!out) { fprintf(stderr, "usage: ovl --out PREFIX\n"); return 1; }
  uint64_t s = 0x243F6A8885A308D3ULL; for (int i = 0; i < 256; i++) { s ^= s << 13; s ^= s >> 7; s ^= s << 17; G[i] = s; }
  const uint64_t MASK = AVGB ? (~0ULL) << (64 - AVGB) : 0;
  mode L, C; m_init(&L, xzcap); m_init(&C, xzcap);
  char fn[4096]; snprintf(fn, sizeof fn, "%s.files.tsv", out); FILE *ff = fopen(fn, "w");
  fprintf(ff, "name\tkind\tbytes\tline_units\tline_new_units\tline_new_bytes\tline_extents\tcdc_units\tcdc_new_units\tcdc_new_bytes\tcdc_extents\n");
  lcap = 1 << 20; lbuf = malloc(lcap); cbuf = malloc(MAX);
  char name[65536]; char kind = 'B'; unsigned char *dbuf = malloc(1 << 22); size_t dcap = 1 << 22;
  for (;;) {
    int op = getchar(); if (op == EOF) break;
    if (op == 'F') {
      kind = (char)getchar(); uint16_t nl; rd(&nl, 2); rd(name, nl); name[nl] = 0;
      m_file_start(&L); m_file_start(&C); llen = 0; clen = 0; gh = 0;
    } else if (op == 'D') {
      uint32_t n; rd(&n, 4); if (n > dcap) { dcap = n; dbuf = realloc(dbuf, dcap); } rd(dbuf, n);
      /* chunk mode */
      for (uint32_t i = 0; i < n; i++) {
        unsigned char b = dbuf[i]; cbuf[clen++] = b; gh = (gh << 1) + G[b];
        if ((clen >= MIN && (gh & MASK) == 0) || clen >= MAX) { m_unit(&C, cbuf, clen, 0x1234567ULL); clen = 0; gh = 0; }
      }
      if (kind == 'T') {
        uint32_t st = 0;
        for (uint32_t i = 0; i < n; i++) if (dbuf[i] == '\n') {
          size_t seg = i + 1 - st;
          if (llen) {
            if (llen + seg > lcap) { while (llen + seg > lcap) lcap *= 2; lbuf = realloc(lbuf, lcap); }
            memcpy(lbuf + llen, dbuf + st, seg); llen += seg; m_unit(&L, lbuf, llen, 0x7654321ULL); llen = 0;
          } else m_unit(&L, dbuf + st, seg, 0x7654321ULL);
          st = i + 1;
        }
        if (st < n) { size_t seg = n - st; if (llen + seg > lcap) { while (llen + seg > lcap) lcap *= 2; lbuf = realloc(lbuf, lcap); } memcpy(lbuf + llen, dbuf + st, seg); llen += seg; }
      }
    } else if (op == 'E') {
      if (clen) { m_unit(&C, cbuf, clen, 0x1234567ULL); clen = 0; }
      if (kind == 'T' && llen) { m_unit(&L, lbuf, llen, 0x7654321ULL); llen = 0; }
      fprintf(ff, "%s\t%c\t%llu\t%llu\t%llu\t%llu\t%llu\t%llu\t%llu\t%llu\t%llu\n", name, kind, (unsigned long long)C.f_bytes,
              (unsigned long long)L.f_units, (unsigned long long)L.f_nunits, (unsigned long long)L.f_nbytes, (unsigned long long)L.f_ext,
              (unsigned long long)C.f_units, (unsigned long long)C.f_nunits, (unsigned long long)C.f_nbytes, (unsigned long long)C.f_ext);
      fflush(ff);
      if (kind == 'T') m_file_end(&L);
      m_file_end(&C);
    } else if (op == 'Q') break;
    else { fprintf(stderr, "bad op %d\n", op); return 5; }
  }
  fclose(ff);
  c_end(&L.c); c_end(&C.c);
  snprintf(fn, sizeof fn, "%s.totals.tsv", out); FILE *ft = fopen(fn, "w");
  fprintf(ft, "mode\tfiles\tunits\tbytes\tunique_units\tunique_bytes\textents\tzlib6_out_all\txz_in_capped\txz6_out_capped\tzlib6_out_capped\ttable_entries\n");
  mode *ms[2] = {&L, &C}; const char *mn[2] = {"line", "cdc"};
  for (int i = 0; i < 2; i++) {
    mode *m = ms[i];
    fprintf(ft, "%s\t%llu\t%llu\t%llu\t%llu\t%llu\t%llu\t%llu\t%llu\t%llu\t%llu\t%llu\n", mn[i], (unsigned long long)m->files, (unsigned long long)m->units,
            (unsigned long long)m->bytes, (unsigned long long)m->nunits, (unsigned long long)m->nbytes, (unsigned long long)m->extents,
            (unsigned long long)m->c.zout, (unsigned long long)m->c.xin, (unsigned long long)m->c.xout, (unsigned long long)m->c.zcout,
            (unsigned long long)m->t.n);
  }
  fclose(ft);
  snprintf(fn, sizeof fn, "%s.line.tab", out); m_dump(&L, fn);
  snprintf(fn, sizeof fn, "%s.cdc.tab", out); m_dump(&C, fn);
  return 0;
}
