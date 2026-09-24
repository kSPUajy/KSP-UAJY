#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int kapasitas = 4;
    int jumlah = 0;
    int *data = malloc((size_t)kapasitas * sizeof *data);
    if (data == NULL) return EXIT_FAILURE;

    long total = 0;
    int nilai;

    while (scanf("%d", &nilai) == 1) {
        if (jumlah == kapasitas) {
            int kapasitas_baru = kapasitas * 2;
            /* Hasil realloc ditampung dulu. Kalau langsung ditimpakan ke
               data dan realloc gagal, satu-satunya pointer ke blok lama
               hilang dan memorinya bocor untuk selamanya. */
            int *lebih = realloc(data, (size_t)kapasitas_baru * sizeof *data);
            if (lebih == NULL) {
                free(data);
                return EXIT_FAILURE;
            }
            data = lebih;
            kapasitas = kapasitas_baru;
        }

        data[jumlah] = nilai;
        jumlah++;
        total += nilai;
    }

    printf("jumlah elemen: %d\n", jumlah);
    printf("total: %ld\n", total);

    printf("terbalik:");
    for (int i = jumlah - 1; i >= 0; i--) {
        printf(" %d", data[i]);
    }
    putchar('\n');

    free(data);
    return 0;
}
