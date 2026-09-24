#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int r;
    int c;
    if (scanf("%d %d", &r, &c) != 2 || r <= 0 || c <= 0) return 1;

    int *m = malloc((size_t)r * (size_t)c * sizeof *m);
    if (m == NULL) return 1;

    for (int i = 0; i < r * c; i++) {
        if (scanf("%d", &m[i]) != 1) {
            free(m);
            return 1;
        }
    }

    int atas = 0;
    int bawah = r - 1;
    int kiri = 0;
    int kanan = c - 1;
    int pertama = 1;

    while (atas <= bawah && kiri <= kanan) {
        for (int j = kiri; j <= kanan; j++) {
            if (!pertama) putchar(' ');
            printf("%d", m[atas * c + j]);
            pertama = 0;
        }
        atas++;

        for (int i = atas; i <= bawah; i++) {
            if (!pertama) putchar(' ');
            printf("%d", m[i * c + kanan]);
            pertama = 0;
        }
        kanan--;

        /* Dua penjagaan ini yang menyelamatkan matriks satu baris dan
           satu kolom dari tercetak dua kali. */
        if (atas <= bawah) {
            for (int j = kanan; j >= kiri; j--) {
                if (!pertama) putchar(' ');
                printf("%d", m[bawah * c + j]);
                pertama = 0;
            }
            bawah--;
        }

        if (kiri <= kanan) {
            for (int i = bawah; i >= atas; i--) {
                if (!pertama) putchar(' ');
                printf("%d", m[i * c + kiri]);
                pertama = 0;
            }
            kiri++;
        }
    }

    putchar('\n');
    free(m);
    return 0;
}
