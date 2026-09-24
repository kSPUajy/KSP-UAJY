#include <stdio.h>

/* Memecah kalimat jadi kata tanpa strtok.
   strtok mengubah string aslinya dan menyimpan keadaan
   tersembunyi antar pemanggilan. Menghitung panjang tiap kata
   sendiri jauh lebih mudah ditelusuri saat ada yang salah. */
int main(void) {
    const char *kalimat = "kelompok studi pemrograman uajy";
    int i = 0;
    int nomor = 1;

    while (kalimat[i] != '\0') {
        /* lewati spasi di depan kata */
        while (kalimat[i] == ' ') i++;
        if (kalimat[i] == '\0') break;

        int awal = i;
        while (kalimat[i] != ' ' && kalimat[i] != '\0') i++;

        printf("%d. %.*s (%d huruf)\n", nomor, i - awal, kalimat + awal, i - awal);
        nomor++;
    }

    return 0;
}
