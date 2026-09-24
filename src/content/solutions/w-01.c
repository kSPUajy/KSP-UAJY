#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) return 1;

    long total = 0;
    int tertinggi = 0;
    int terendah = 0;

    for (int i = 0; i < n; i++) {
        int suhu;
        if (scanf("%d", &suhu) != 1) return 1;

        total += suhu;
        if (i == 0 || suhu > tertinggi) tertinggi = suhu;
        if (i == 0 || suhu < terendah) terendah = suhu;
    }

    /* Pembagian harus dipaksa jadi pecahan dulu. total / n memakai
       pembagian bulat dan membuang sisanya sebelum sempat dicetak. */
    printf("rata-rata: %.2f\n", (double)total / (double)n);
    printf("tertinggi: %d\n", tertinggi);
    printf("terendah: %d\n", terendah);

    return 0;
}
