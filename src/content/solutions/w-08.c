#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAKS_NAMA 256

typedef struct {
    char nama[33];
    long total;
} Rekap;

static int bandingkan(const void *a, const void *b) {
    const Rekap *p = (const Rekap *)a;
    const Rekap *q = (const Rekap *)b;
    return strcmp(p->nama, q->nama);
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 0) return 1;

    Rekap rekap[MAKS_NAMA];
    int jumlah = 0;

    for (int i = 0; i < n; i++) {
        char baris[128];
        if (scanf("%127s", baris) != 1) return 1;

        char *pemisah = strchr(baris, ';');
        if (pemisah == NULL) return 1;
        *pemisah = '\0';
        long durasi = strtol(pemisah + 1, NULL, 10);

        int ketemu = -1;
        for (int j = 0; j < jumlah; j++) {
            if (strcmp(rekap[j].nama, baris) == 0) {
                ketemu = j;
                break;
            }
        }

        if (ketemu >= 0) {
            rekap[ketemu].total += durasi;
        } else {
            if (jumlah == MAKS_NAMA) return 1;
            snprintf(rekap[jumlah].nama, sizeof rekap[jumlah].nama, "%s", baris);
            rekap[jumlah].total = durasi;
            jumlah++;
        }
    }

    qsort(rekap, (size_t)jumlah, sizeof rekap[0], bandingkan);

    FILE *tulis = fopen("rekap.txt", "w");
    if (tulis == NULL) {
        perror("rekap.txt");
        return EXIT_FAILURE;
    }
    for (int i = 0; i < jumlah; i++) {
        fprintf(tulis, "%s %ld\n", rekap[i].nama, rekap[i].total);
    }
    /* Tutup sebelum dibuka lagi: data yang masih tertahan di buffer
       belum tentu sudah sampai ke disk. */
    fclose(tulis);

    FILE *baca = fopen("rekap.txt", "r");
    if (baca == NULL) {
        perror("rekap.txt");
        return EXIT_FAILURE;
    }

    char baris[160];
    while (fgets(baris, (int)sizeof baris, baca) != NULL) {
        fputs(baris, stdout);
    }
    fclose(baca);

    return 0;
}
