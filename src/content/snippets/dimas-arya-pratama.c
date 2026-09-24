#include <stdio.h>

/* Menara Hanoi. Kasus dasar ditulis lebih dulu, dan itulah
   satu-satunya alasan rekursi ini berhenti. */
void pindah(int n, char dari, char ke, char bantu) {
    if (n == 0) return;

    pindah(n - 1, dari, bantu, ke);
    printf("cakram %d: %c -> %c\n", n, dari, ke);
    pindah(n - 1, bantu, ke, dari);
}

int main(void) {
    pindah(3, 'A', 'C', 'B');
    return 0;
}
