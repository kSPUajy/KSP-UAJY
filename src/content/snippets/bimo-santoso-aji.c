#include <stdio.h>
#include <stdlib.h>

/* Menulis lalu membaca kembali sebuah berkas.
   Setiap fungsi yang menyentuh dunia luar bisa gagal, jadi
   nilai kembalian fopen selalu diperiksa sebelum dipakai. */
int main(void) {
    const char *nama = "catatan_ksp.txt";

    FILE *tulis = fopen(nama, "w");
    if (tulis == NULL) {
        perror("gagal membuka berkas untuk ditulis");
        return EXIT_FAILURE;
    }
    fputs("pointer\nstruct\nrekursi\n", tulis);
    fclose(tulis);

    FILE *baca = fopen(nama, "r");
    if (baca == NULL) {
        perror("gagal membuka berkas untuk dibaca");
        return EXIT_FAILURE;
    }

    char baris[128];
    int nomor = 1;
    while (fgets(baris, (int)sizeof baris, baca) != NULL) {
        printf("%02d| %s", nomor, baris);
        nomor++;
    }

    fclose(baca);
    remove(nama);

    return 0;
}
