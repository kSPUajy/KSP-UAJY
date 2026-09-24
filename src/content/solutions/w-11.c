#include <stdio.h>
#include <string.h>

typedef struct {
    const char *nama;
    unsigned int geser;
    unsigned int masker;
} Medan;

static const Medan MEDAN[] = {
    {"hadir",     0u, 0xFFu},
    {"nilai",     8u, 0xFFu},
    {"lunas",    16u, 0x01u},
    {"angkatan", 17u, 0x0Fu},
};

static const Medan *cari_medan(const char *nama) {
    const int banyak = (int)(sizeof MEDAN / sizeof MEDAN[0]);
    for (int i = 0; i < banyak; i++) {
        if (strcmp(MEDAN[i].nama, nama) == 0) return &MEDAN[i];
    }
    return NULL;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;

    /* unsigned, bukan int: pergeseran kiri pada bilangan bertanda yang
       meluap adalah perilaku tak terdefinisi. */
    unsigned int status = 0u;

    for (int i = 0; i < n; i++) {
        char perintah[8];
        if (scanf("%7s", perintah) != 1) break;

        if (strcmp(perintah, "RAW") == 0) {
            printf("%08X\n", status);
            continue;
        }

        char nama[16];
        if (scanf("%15s", nama) != 1) break;

        const Medan *medan = cari_medan(nama);
        if (medan == NULL) continue;

        if (strcmp(perintah, "SET") == 0) {
            unsigned int baru;
            if (scanf("%u", &baru) != 1) break;
            status &= ~(medan->masker << medan->geser);
            status |= (baru & medan->masker) << medan->geser;
        } else if (strcmp(perintah, "GET") == 0) {
            printf("%u\n", (status >> medan->geser) & medan->masker);
        }
    }

    return 0;
}
