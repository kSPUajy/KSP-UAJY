#include <stdio.h>

static long nomor = 0;

static void pindah(int n, char dari, char ke, char bantu) {
    if (n == 0) return;

    pindah(n - 1, dari, bantu, ke);
    nomor++;
    printf("%ld: %c->%c\n", nomor, dari, ke);
    pindah(n - 1, bantu, ke, dari);
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 1) return 1;

    long langkah = (1L << n) - 1L;
    printf("%ld langkah\n", langkah);

    pindah(n, 'A', 'C', 'B');
    return 0;
}
