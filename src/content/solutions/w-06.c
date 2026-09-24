#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Simpul {
    char judul[65];
    struct Simpul *next;
} Simpul;

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;

    Simpul *depan = NULL;

    for (int i = 0; i < n; i++) {
        char perintah[8];
        if (scanf("%7s", perintah) != 1) break;

        if (strcmp(perintah, "T") == 0) {
            Simpul *baru = malloc(sizeof *baru);
            if (baru == NULL) return 1;
            if (scanf("%64s", baru->judul) != 1) {
                free(baru);
                return 1;
            }
            baru->next = depan;
            depan = baru;
        } else if (strcmp(perintah, "A") == 0) {
            if (depan == NULL) {
                puts("kosong");
                continue;
            }
            /* Simpan penerusnya SEBELUM membebaskan simpul ini.
               Membaca depan->next setelah free adalah perilaku tak
               terdefinisi, dan biasanya kelihatan berhasil sampai
               suatu hari tidak. */
            Simpul *berikut = depan->next;
            puts(depan->judul);
            free(depan);
            depan = berikut;
        } else if (strcmp(perintah, "L") == 0) {
            if (depan == NULL) {
                puts("kosong");
                continue;
            }
            for (const Simpul *p = depan; p != NULL; p = p->next) {
                printf("%s", p->judul);
                if (p->next != NULL) printf(" -> ");
            }
            putchar('\n');
        }
    }

    while (depan != NULL) {
        Simpul *berikut = depan->next;
        free(depan);
        depan = berikut;
    }

    return 0;
}
