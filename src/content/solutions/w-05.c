#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char nama[33];
    int nilai;
} Peserta;

/* Nilai menurun lebih dulu; nama menaik hanya dipakai kalau seri. */
static int bandingkan(const void *a, const void *b) {
    const Peserta *p = (const Peserta *)a;
    const Peserta *q = (const Peserta *)b;

    if (p->nilai != q->nilai) return q->nilai - p->nilai;
    return strcmp(p->nama, q->nama);
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) return 1;

    Peserta *daftar = malloc((size_t)n * sizeof *daftar);
    if (daftar == NULL) return 1;

    for (int i = 0; i < n; i++) {
        if (scanf("%32s %d", daftar[i].nama, &daftar[i].nilai) != 2) {
            free(daftar);
            return 1;
        }
    }

    qsort(daftar, (size_t)n, sizeof *daftar, bandingkan);

    for (int i = 0; i < n; i++) {
        printf("%d. %s %d\n", i + 1, daftar[i].nama, daftar[i].nilai);
    }

    free(daftar);
    return 0;
}
