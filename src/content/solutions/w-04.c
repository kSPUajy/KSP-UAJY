#include <stdio.h>

/* 100! punya 158 digit. 200 elemen memberi ruang lebih dari cukup. */
#define MAKS_DIGIT 200

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 0) return 1;

    /* Digit paling tidak signifikan di indeks nol, supaya perambatan
       sisa penyimpanan bergerak maju, bukan mundur. */
    int digit[MAKS_DIGIT] = {0};
    int panjang = 1;
    digit[0] = 1;

    for (int faktor = 2; faktor <= n; faktor++) {
        int simpan = 0;

        for (int i = 0; i < panjang; i++) {
            int hasil = digit[i] * faktor + simpan;
            digit[i] = hasil % 10;
            simpan = hasil / 10;
        }

        while (simpan > 0) {
            digit[panjang] = simpan % 10;
            panjang++;
            simpan /= 10;
        }
    }

    for (int i = panjang - 1; i >= 0; i--) {
        putchar('0' + digit[i]);
    }
    putchar('\n');

    return 0;
}
