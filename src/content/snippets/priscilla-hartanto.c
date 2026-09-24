#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Data yang berhubungan tinggal bersama dalam satu struct,
   bukan tersebar di beberapa array paralel yang harus dijaga
   supaya indeksnya tetap sejajar. */
typedef struct {
    char nama[32];
    int nilai;
} Peserta;

/* Dua kunci: nilai menurun, lalu nama menaik sebagai penentu
   kalau nilainya sama. */
int bandingkan(const void *a, const void *b) {
    const Peserta *p = (const Peserta *)a;
    const Peserta *q = (const Peserta *)b;

    if (p->nilai != q->nilai) return q->nilai - p->nilai;
    return strcmp(p->nama, q->nama);
}

int main(void) {
    Peserta daftar[] = {
        {"Nadia", 92},
        {"Gilang", 95},
        {"Rangga", 92},
        {"Ivana", 88},
    };
    const int n = (int)(sizeof daftar / sizeof daftar[0]);

    qsort(daftar, (size_t)n, sizeof daftar[0], bandingkan);

    for (int i = 0; i < n; i++) {
        printf("%d. %-8s %d\n", i + 1, daftar[i].nama, daftar[i].nilai);
    }

    return 0;
}
