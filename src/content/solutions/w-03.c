#include <ctype.h>
#include <stdio.h>

int main(void) {
    char baris[256];
    if (fgets(baris, (int)sizeof baris, stdin) == NULL) return 1;

    /* Saring dulu jadi huruf kecil dan angka saja. Membandingkan
       sambil melompati tanda baca di dua arah sekaligus jauh lebih
       mudah salah daripada menyalinnya sekali. */
    char bersih[256];
    int n = 0;
    for (int i = 0; baris[i] != '\0'; i++) {
        unsigned char c = (unsigned char)baris[i];
        if (isalnum(c)) {
            bersih[n] = (char)tolower(c);
            n++;
        }
    }

    int kiri = 0;
    int kanan = n - 1;
    int palindrom = 1;

    while (kiri < kanan) {
        if (bersih[kiri] != bersih[kanan]) {
            palindrom = 0;
            break;
        }
        kiri++;
        kanan--;
    }

    puts(palindrom ? "palindrom" : "bukan palindrom");
    return 0;
}
