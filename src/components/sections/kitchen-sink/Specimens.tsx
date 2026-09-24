import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Typewriter } from '@/components/motion/Typewriter'
import { CrtVignette, DotGrid, Grain, Scanlines } from '@/components/overlays/Overlays'
import { Countdown } from '@/components/sections/challenge/Countdown'
import { Accordion } from '@/components/ui/Accordion'
import { Badge, DifficultyBadge, Tag } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { DitherImage } from '@/components/ui/DitherImage'
import { EmptyState } from '@/components/ui/EmptyState'
import { GutteredBlock } from '@/components/ui/LineGutter'
import { Marquee } from '@/components/ui/Marquee'
import { MeterBar } from '@/components/ui/MeterBar'
import { Prompt } from '@/components/ui/Prompt'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { Stat } from '@/components/ui/Stat'
import { StructBlock } from '@/components/ui/StructBlock'
import { Tabs } from '@/components/ui/Tabs'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { ACCENTS, DIFFICULTY_ACCENT } from '@/lib/accent'
import { DIFFICULTIES } from '@/lib/types'

const SAMPLE_C = `#include <stdio.h>
#include <stdlib.h>

/* Membalik linked list secara iteratif: O(n) waktu, O(1) memori. */
typedef struct Node {
    int value;
    struct Node *next;
} Node;

static Node *reverse(Node *head) {
    Node *prev = NULL;
    while (head != NULL) {
        Node *next = head->next;
        head->next = prev;
        prev = head;
        head = next;
    }
    return prev;
}

int main(void) {
    Node *head = NULL;

    for (int i = 1; i <= 5; i++) {
        Node *node = malloc(sizeof(Node));
        if (node == NULL) {
            fprintf(stderr, "malloc gagal\\n");
            return EXIT_FAILURE;
        }
        node->value = i;
        node->next = head;
        head = node;
    }

    head = reverse(head);
    for (Node *p = head; p != NULL; p = p->next) {
        printf("%d ", p->value);
    }
    putchar('\\n');

    while (head != NULL) {
        Node *next = head->next;
        free(head);
        head = next;
    }
    return 0;
}`

/** Fixed dates, so the specimen never depends on when the page is built. */
const SPECIMEN_DEADLINE_OPEN = '2030-12-31T23:59'
const SPECIMEN_DEADLINE_CLOSED = '2020-01-01T00:00'

const MARQUEE_TOKENS = [
  'malloc', 'free', 'NULL', 'struct', 'printf', 'sizeof',
  '0xDEADBEEF', 'segfault', 'pointer', 'int main(void)',
]

const SEMANTIC_TOKENS = [
  ['canvas', 'bg-canvas'],
  ['canvas-alt', 'bg-canvas-alt'],
  ['surface', 'bg-surface'],
  ['surface-2', 'bg-surface-2'],
  ['code-bg', 'bg-code-bg'],
  ['accent', 'bg-accent'],
] as const

const LEADERBOARD = [
  ['Andi Pratama', 9],
  ['Rani Kusuma', 7],
  ['Bagas Nugroho', 5],
  ['Sinta Halim', 3],
] as const

function Spec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b-2 border-line-soft px-5 py-8 last:border-b-0">
      <p className="font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
        {`// ${title}`}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  )
}

/**
 * Every primitive in the system, rendered once.
 *
 * The kitchen sink route mounts this twice — once per palette — so a token
 * that only works in the dark is impossible to miss. The strings here are
 * specimens, not content, which is why they live in the component rather than
 * coming from the data layer.
 */
export function Specimens() {
  return (
    <div>
      <Spec title="accents">
        <div className="grid grid-cols-3 gap-3">
          {ACCENTS.map((accent) => (
            <div key={accent} data-accent={accent} className="flex flex-col gap-2">
              <span className="block h-10 border-2 border-line bg-accent" />
              <span className="text-[10px] text-accent-fg">{accent}</span>
            </div>
          ))}
        </div>
      </Spec>

      <Spec title="surfaces">
        <div className="grid grid-cols-3 gap-3">
          {SEMANTIC_TOKENS.map(([name, className]) => (
            <div key={name} className="flex flex-col gap-2">
              <span className={`block h-10 border-2 border-line ${className}`} />
              <span className="text-[10px] text-muted">{name}</span>
            </div>
          ))}
        </div>
      </Spec>

      <Spec title="typography">
        <div className="space-y-4">
          <p className="font-display text-2xl tracking-[0.04em] text-fg uppercase">Silkscreen 24</p>
          <p className="font-display text-[10px] tracking-[0.18em] text-muted uppercase">
            Silkscreen 10 — eyebrow
          </p>
          <p className="font-mono text-sm text-fg">JetBrains Mono 14 — UI dan data terstruktur</p>
          <p className="font-mono text-[11px] text-dim">JetBrains Mono 11 — metadata</p>
          <p className="measure font-sans text-[17px] leading-[1.75] text-fg">
            IBM Plex Sans 17 — badan artikel. Dipakai hanya untuk teks panjang di berita dan
            write-up challenge, karena di sanalah keterbacaan lebih penting daripada karakter.
          </p>
        </div>
      </Spec>

      <Spec title="buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">solid sm</Button>
          <Button>solid md</Button>
          <Button size="lg">solid lg</Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button variant="outline">outline</Button>
          <Button variant="ghost">ghost</Button>
          <Button disabled>disabled</Button>
          <ButtonLink href="/kitchen-sink" variant="outline" size="sm">
            link
          </ButtonLink>
        </div>
      </Spec>

      <Spec title="badges">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="solid">solid</Badge>
          <Badge variant="outline">outline</Badge>
          <Badge variant="ghost">ghost</Badge>
          <Badge variant="outline" size="sm">
            sm
          </Badge>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {DIFFICULTIES.map((difficulty) => (
            <DifficultyBadge key={difficulty} difficulty={difficulty} />
          ))}
        </div>
        <p className="mt-4 text-[11px] text-dim">
          Difficulty selalu bawa accent-nya sendiri:{' '}
          {DIFFICULTIES.map((d) => `${d}=${DIFFICULTY_ACCENT[d]}`).join(', ')}
        </p>
      </Spec>

      <Spec title="section header">
        <SectionHeader
          index={3}
          eyebrow="tentor"
          title="Yang mengajar tiap minggu"
          description="Delapan tentor aktif, semuanya mahasiswa yang sudah lewat jalur yang sama."
          actions={
            <ButtonLink href="/kitchen-sink" variant="outline" size="sm">
              semua
            </ButtonLink>
          }
        />
      </Spec>

      <Spec title="terminal window">
        <div className="space-y-6">
          <TerminalWindow title="~/tentor/andi_pratama.c">
            <p className="text-sm leading-6 text-muted">
              Kartu standar. Title bar memuat path asli, bukan sekadar hiasan.
            </p>
          </TerminalWindow>

          <TerminalWindow title="~/challenge/minggu-07.c" accent="orange" interactive>
            <p className="text-sm leading-6 text-muted">
              Varian interaktif: hover menggeser kartu ke arah bayangannya.
            </p>
          </TerminalWindow>

          <TerminalWindow title="~/nested.h" shadow={false} tone="canvas">
            <p className="text-sm leading-6 text-muted">Tanpa bayangan, untuk panel bersarang.</p>
          </TerminalWindow>
        </div>
      </Spec>

      <Spec title="code block">
        <CodeBlock
          code={SAMPLE_C}
          filename="~/challenge/minggu-09/reverse_list.c"
          maxHeight="320px"
          caption="Highlighting ditulis sendiri — token-nya ikut tema dan accent section."
        />
      </Spec>

      <Spec title="prompt">
        <Prompt>./kelompok-studi --bahasa=C --status=open</Prompt>
        <Prompt symbol=">" className="mt-2">
          gcc -Wall -Wextra -O2 reverse_list.c -o reverse
        </Prompt>
        <Prompt cursor className="mt-2">
          menunggu input
        </Prompt>
      </Spec>

      <Spec title="typewriter">
        <p className="text-xs text-muted">
          <Typewriter text="$ ./ksp --mode=demo" charDelay={0.045} cursor />
        </p>
      </Spec>

      <Spec title="tag">
        <div className="flex flex-wrap gap-2">
          <Tag>pointer</Tag>
          <Tag>memori-dinamis</Tag>
          <Tag prefix="">manajemen memori</Tag>
        </div>
      </Spec>

      <Spec title="struct block">
        <StructBlock
          type="challenge"
          name="minggu_12"
          label="Contoh detail challenge"
          fields={[
            { key: 'rilis', value: 'Senin, 21 Sep 2026' },
            { key: 'peserta', value: 14 },
            { key: 'status', value: 'TERBUKA', kind: 'ident' },
          ]}
        />
      </Spec>

      <Spec title="countdown">
        <div className="space-y-8">
          <Countdown
            deadline={SPECIMEN_DEADLINE_OPEN}
            deadlineLabel="contoh: tenggat jauh di depan"
            closed={<p className="text-muted">ditutup</p>}
          />
          <Countdown
            deadline={SPECIMEN_DEADLINE_CLOSED}
            deadlineLabel="contoh: tenggat sudah lewat"
            closedAtRender
            closed={
              <p className="flex items-center gap-3 text-muted">
                <Badge size="sm">ditutup</Badge> slot `closed` dari server
              </p>
            }
          />
        </div>
      </Spec>

      <Spec title="stats">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat value={142} label="anggota aktif" />
          <Stat value={8} label="tentor" accent="cyan" />
          <Stat value={12} label="challenge terbit" accent="orange" />
          <Stat value={1284} label="submission" accent="lime" />
        </div>
      </Spec>

      <Spec title="meter bars">
        <ul className="space-y-4">
          {LEADERBOARD.map(([name, wins], index) => (
            <li key={name} className="flex items-center gap-4">
              <span className="w-6 shrink-0 text-[11px] text-dim tabular-nums">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <span className="w-32 shrink-0 truncate text-xs text-fg">{name}</span>
              <MeterBar
                value={wins}
                max={9}
                label={`${name}, ${wins} kemenangan`}
                delay={index * 0.06}
              />
              <span className="w-6 shrink-0 text-right text-xs text-accent-fg tabular-nums">
                {wins}
              </span>
            </li>
          ))}
        </ul>
      </Spec>

      <Spec title="tabs">
        <Tabs
          ariaLabel="Contoh tab"
          accent="violet"
          items={[
            {
              id: 'solusi',
              label: 'solusi',
              content: (
                <p className="p-4 text-sm leading-7 text-muted">
                  Panel pertama. Panah kiri/kanan memindah sekaligus memilih, Home/End lompat ke
                  ujung.
                </p>
              ),
            },
            {
              id: 'pendekatan',
              label: 'pendekatan',
              content: (
                <p className="p-4 text-sm leading-7 text-muted">
                  Panel kedua. Indikator geser pakai layoutId yang sama dengan nav.
                </p>
              ),
            },
          ]}
        />
      </Spec>

      <Spec title="accordion">
        <Accordion
          numbered
          accent="amber"
          items={[
            {
              id: 'syarat',
              title: 'Apa syarat gabung KSP?',
              meta: 'umum',
              content: <p>Mahasiswa aktif, tidak harus sudah bisa C.</p>,
            },
            {
              id: 'biaya',
              title: 'Ada biaya pendaftaran?',
              meta: 'umum',
              content: <p>Tidak ada. Semua kegiatan gratis untuk anggota.</p>,
            },
          ]}
        />

        <div className="mt-6">
          <Accordion
            variant="unlock"
            accent="magenta"
            items={[
              {
                id: 'hint-1',
                title: 'Hint 1',
                content: <p>Pikirkan apa yang terjadi kalau kamu simpan pointer sebelumnya.</p>,
              },
              {
                id: 'hint-2',
                title: 'Hint 2',
                content: <p>Tiga pointer sudah cukup: prev, head, next.</p>,
              },
            ]}
          />
        </div>
      </Spec>

      <Spec title="marquee">
        <Marquee items={MARQUEE_TOKENS} duration={26} className="-mx-5" />
      </Spec>

      <Spec title="line gutter">
        <GutteredBlock lines={5}>
          <p className="text-sm leading-6 text-muted">
            Rail nomor baris mengunci teks ke baseline 24px. Dia inert, tidak bisa diseleksi, dan
            disembunyikan di bawah breakpoint sm supaya tidak makan 44px di layar kecil.
          </p>
        </GutteredBlock>
      </Spec>

      <Spec title="image">
        <DitherImage
          src="https://picsum.photos/seed/ksp-kitchen-sink/640/400"
          alt="Peserta workshop sedang menatap layar berisi kode C"
          width={640}
          height={400}
          accent="lime"
          sizes="(min-width: 1024px) 40vw, 90vw"
        />
      </Spec>

      <Spec title="overlays">
        <div className="relative h-32 overflow-hidden border-2 border-line bg-surface">
          <DotGrid />
          <Scanlines />
          <Grain />
          <CrtVignette />
          <p className="relative p-4 text-xs text-muted">
            dot grid + scanlines + grain + vignette, semuanya pointer-events-none
          </p>
        </div>
      </Spec>

      <Spec title="loading state">
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <SkeletonText lines={3} />
        </div>
      </Spec>

      <Spec title="empty state">
        <EmptyState
          command="ls ~/challenge --filter=SEGFAULT"
          output="0 hasil"
          title="Belum ada challenge di sini"
          description="Filter kamu terlalu sempit. Coba longgarkan difficulty atau topiknya."
          action={
            <Button variant="outline" size="sm">
              reset filter
            </Button>
          }
        />
      </Spec>

      <Spec title="reveal">
        <Stagger className="grid grid-cols-2 gap-3">
          {['satu', 'dua', 'tiga', 'empat'].map((label) => (
            <StaggerItem key={label}>
              <div className="border-2 border-line-soft bg-surface-2 p-4 text-xs text-muted">
                {label}
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-4">
          <div className="border-2 border-line-soft bg-surface-2 p-4 text-xs text-muted">
            reveal tunggal
          </div>
        </Reveal>
      </Spec>
    </div>
  )
}
