#include <stdio.h>

/* Menghitung bit menyala dengan trik Kernighan.
   n & (n - 1) menghapus satu bit menyala paling kanan, jadi
   perulangan hanya berjalan sebanyak bit yang benar-benar
   menyala, bukan sebanyak lebar tipe datanya. */
int hitung_bit(unsigned int n) {
    int jumlah = 0;

    while (n != 0u) {
        n &= n - 1u;
        jumlah++;
    }

    return jumlah;
}

int main(void) {
    const unsigned int contoh[] = {0u, 7u, 255u, 0xDEADBEEFu};
    const int n = (int)(sizeof contoh / sizeof contoh[0]);

    for (int i = 0; i < n; i++) {
        printf("%08X -> %d bit menyala\n", contoh[i], hitung_bit(contoh[i]));
    }

    return 0;
}
