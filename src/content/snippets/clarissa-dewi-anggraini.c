#include <stdio.h>
#include <string.h>

/* Membalik string di tempat: dua penunjuk berjalan saling
   mendekat sampai bertemu di tengah. Tidak ada memori baru
   yang dialokasikan. */
void balik(char *s) {
    int kiri = 0;
    int kanan = (int)strlen(s) - 1;

    while (kiri < kanan) {
        char simpan = s[kiri];
        s[kiri] = s[kanan];
        s[kanan] = simpan;
        kiri++;
        kanan--;
    }
}

int main(void) {
    /* Array, bukan string literal: literal bersifat baca-saja. */
    char kata[] = "informatika";

    balik(kata);
    printf("%s\n", kata);

    return 0;
}
