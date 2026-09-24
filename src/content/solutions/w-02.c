#include <stdio.h>
#include <stdlib.h>

/* Tidak ada satu pun tanda kurung siku di berkas ini. Setiap akses
   ke elemen array ditulis sebagai aritmetika pointer. */
int main(void) {
    int n;
    int k;
    if (scanf("%d %d", &n, &k) != 2 || n <= 0 || k <= 0) return 1;

    int *data = malloc((size_t)n * sizeof *data);
    if (data == NULL) return 1;

    for (int i = 0; i < n; i++) {
        if (scanf("%d", data + i) != 1) {
            free(data);
            return 1;
        }
    }

    const int *p = data;
    const int *akhir = data + n;
    int pertama = 1;

    while (p < akhir) {
        if (!pertama) putchar(' ');
        printf("%d", *p);
        pertama = 0;
        p += k;
    }
    putchar('\n');

    free(data);
    return 0;
}
