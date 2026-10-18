/* tabmerge: union of sorted unit tables written by ovl (records: u64 hash, u32 len, u32 pad; sorted by hash).
 * Prints, for the union: unique units and bytes; and for each input: its units/bytes and the bytes it shares with
 * at least one other input. Usage: tabmerge A.tab B.tab ...  (read-only on its inputs). */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
typedef struct { uint64_t k; uint32_t len, pad; } ent;
int main(int argc, char **argv) {
  int n = argc - 1; FILE **f = calloc(n, sizeof *f); ent *cur = calloc(n, sizeof *cur); int *live = calloc(n, sizeof *live);
  uint64_t *ub = calloc(n, 8), *uu = calloc(n, 8), *sb = calloc(n, 8), *ob = calloc(n, 8);
  for (int i = 0; i < n; i++) { f[i] = fopen(argv[i + 1], "rb"); live[i] = f[i] && fread(&cur[i], sizeof(ent), 1, f[i]) == 1; }
  uint64_t U = 0, B = 0, S2 = 0;
  for (;;) {
    int any = 0; uint64_t mk = 0;
    for (int i = 0; i < n; i++) if (live[i] && (!any || cur[i].k < mk)) { mk = cur[i].k; any = 1; }
    if (!any) break;
    int cnt = 0; uint32_t len = 0;
    for (int i = 0; i < n; i++) if (live[i] && cur[i].k == mk) { cnt++; len = cur[i].len; }
    U++; B += len; if (cnt > 1) S2 += len;
    for (int i = 0; i < n; i++) if (live[i] && cur[i].k == mk) {
      uu[i]++; ub[i] += len; if (cnt > 1) sb[i] += len;
      live[i] = fread(&cur[i], sizeof(ent), 1, f[i]) == 1;
    }
  }
  printf("union\tunits\t%llu\tbytes\t%llu\tbytes_in_2plus_inputs\t%llu\n", (unsigned long long)U, (unsigned long long)B, (unsigned long long)S2);
  for (int i = 0; i < n; i++) printf("%s\tunits\t%llu\tbytes\t%llu\tshared_bytes\t%llu\n", argv[i + 1], (unsigned long long)uu[i], (unsigned long long)ub[i], (unsigned long long)sb[i]);
  return 0;
}
