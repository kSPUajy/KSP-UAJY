#include <stdio.h>

/* Pencarian biner pada array terurut menaik.
   Titik tengah dihitung sebagai lo + (hi - lo) / 2, bukan
   (lo + hi) / 2, supaya penjumlahannya tidak pernah meluap
   ketika lo dan hi sama-sama besar. */
int cari(const int *data, int n, int target) {
    int lo = 0;
    int hi = n - 1;

    while (lo <= hi) {
        int tengah = lo + (hi - lo) / 2;

        if (data[tengah] == target) return tengah;
        if (data[tengah] < target) lo = tengah + 1;
        else hi = tengah - 1;
    }

    return -1;
}

int main(void) {
    const int data[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    const int n = (int)(sizeof data / sizeof data[0]);

    printf("23 ada di indeks %d\n", cari(data, n, 23));
    printf("24 ada di indeks %d\n", cari(data, n, 24));

    return 0;
}
