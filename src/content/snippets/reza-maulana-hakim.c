#include <stdio.h>

/* Menukar dua nilai lewat alamatnya, bukan salinannya.
   Tanpa pointer, fungsi ini hanya akan menukar salinan lokal
   dan nilai di pemanggil tidak berubah sama sekali. */
void tukar(int *a, int *b) {
    int simpan = *a;
    *a = *b;
    *b = simpan;
}

int main(void) {
    int x = 3;
    int y = 8;

    printf("sebelum : x=%d y=%d\n", x, y);
    tukar(&x, &y);
    printf("sesudah : x=%d y=%d\n", x, y);

    return 0;
}
