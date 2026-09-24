import 'server-only'

import { pixelPortrait } from '@/lib/pixel-portrait'
import type { Member } from '@/lib/types'

/**
 * Until a real photo is uploaded, each person gets a pixel portrait of their
 * initials. Swap the call for a photo URL — any 4:5 image — and nothing else
 * changes.
 */
const portrait = pixelPortrait

/** Seats whose names are not announced yet: replace with `nama`, `slug`, `foto`, `bio`. */
const PLACEHOLDER = {
  nama: 'Belum diisi',
  foto: pixelPortrait('?'),
  angkatan: 2025,
  socials: {},
} as const

/**
 * The org chart, flat: pengurus harian 2025/2026, then the divisions.
 * USDA's names are still to come — see `PLACEHOLDER`.
 *
 * Nesting is never written here — `parentId` is the only structural field, and
 * `buildMemberTree` in `src/lib/tree.ts` derives the hierarchy from it.
 * Order within a parent is the order people are listed.
 */
export const members: readonly Member[] = [
  {
    id: 'ph-ketua',
    nama: 'Benedictus Richard Gunawan',
    slug: 'benedictus-richard-gunawan',
    jabatan: 'Ketua',
    divisi: 'inti',
    angkatan: 2025,
    foto: portrait('Benedictus Richard Gunawan'),
    bio: 'Memimpin kepengurusan harian KSP: menjaga arah kegiatan dan memastikan tentoring, sharing session, dan workshop berjalan sesuai rencana.',
    socials: {},
  },
  {
    id: 'ph-koor-tentor',
    nama: 'Klemens Valois',
    slug: 'klemens-valois',
    jabatan: 'Koordinator Tentor',
    divisi: 'inti',
    angkatan: 2025,
    foto: portrait('Klemens Valois'),
    bio: 'Mengoordinasikan para tentor: membagi tentor penanggung jawab tiap modul, menyelaraskan materi mingguan, dan menjadi tempat bertanya para tentor.',
    socials: {},
    parentId: 'ph-ketua',
  },
  {
    id: 'ph-sekretaris-1',
    nama: 'Alexandria Audrey Deitra Wijaya',
    slug: 'alexandria-audrey-deitra-wijaya',
    jabatan: 'Sekretaris 1',
    divisi: 'inti',
    angkatan: 2025,
    foto: portrait('Alexandria Audrey Deitra Wijaya'),
    bio: 'Mengurus administrasi dan surat-menyurat KSP, sekaligus narahubung sekretariat untuk anggota maupun pihak kampus.',
    socials: {},
    parentId: 'ph-ketua',
  },
  {
    id: 'ph-sekretaris-2',
    nama: 'Veronika Rena Yuliastuti',
    slug: 'veronika-rena-yuliastuti',
    jabatan: 'Sekretaris 2',
    divisi: 'inti',
    angkatan: 2025,
    foto: portrait('Veronika Rena Yuliastuti'),
    bio: 'Mendampingi pengelolaan administrasi KSP: pencatatan kegiatan, arsip, dan kebutuhan kesekretariatan lainnya.',
    socials: {},
    parentId: 'ph-ketua',
  },
  {
    id: 'ph-bendahara',
    nama: 'Michelle Valencia Susanto Njo',
    slug: 'michelle-valencia-susanto-njo',
    jabatan: 'Bendahara',
    divisi: 'inti',
    angkatan: 2025,
    foto: portrait('Michelle Valencia Susanto Njo'),
    bio: 'Mengelola keuangan KSP, dari anggaran kegiatan hingga laporan pertanggungjawaban.',
    socials: {},
    parentId: 'ph-ketua',
  },
  {
    id: 'kominfo-koordinator',
    nama: 'Graciano Marcel Christianto',
    slug: 'graciano-marcel-christianto',
    jabatan: 'Koordinator Kominfo',
    divisi: 'kominfo',
    angkatan: 2025,
    foto: portrait('Graciano Marcel Christianto'),
    bio: 'Memimpin divisi komunikasi dan informasi: publikasi kegiatan, media sosial, dan dokumentasi KSP.',
    socials: {},
    parentId: 'ph-ketua',
  },
  {
    id: 'kominfo-dwi-enzelica-sipayung',
    nama: 'Dwi Enzelica Sipayung',
    slug: 'dwi-enzelica-sipayung',
    jabatan: 'Staf Kominfo',
    divisi: 'kominfo',
    angkatan: 2025,
    foto: portrait('Dwi Enzelica Sipayung'),
    bio: 'Membantu publikasi, desain konten, dan dokumentasi kegiatan KSP.',
    socials: {},
    parentId: 'kominfo-koordinator',
  },
  {
    id: 'kominfo-michael-gamaliel-bellarmino',
    nama: 'Michael Gamaliel Bellarmino',
    slug: 'michael-gamaliel-bellarmino',
    jabatan: 'Staf Kominfo',
    divisi: 'kominfo',
    angkatan: 2025,
    foto: portrait('Michael Gamaliel Bellarmino'),
    bio: 'Membantu publikasi, desain konten, dan dokumentasi kegiatan KSP.',
    socials: {},
    parentId: 'kominfo-koordinator',
  },
  {
    id: 'kominfo-andreas-clein-jatmika',
    nama: 'Andreas Clein Jatmika',
    slug: 'andreas-clein-jatmika',
    jabatan: 'Staf Kominfo',
    divisi: 'kominfo',
    angkatan: 2025,
    foto: portrait('Andreas Clein Jatmika'),
    bio: 'Membantu publikasi, desain konten, dan dokumentasi kegiatan KSP.',
    socials: {},
    parentId: 'kominfo-koordinator',
  },
  {
    id: 'kominfo-jonathan-evquarel-pebrian',
    nama: 'Jonathan Evquarel Pebrian',
    slug: 'jonathan-evquarel-pebrian',
    jabatan: 'Staf Kominfo',
    divisi: 'kominfo',
    angkatan: 2025,
    foto: portrait('Jonathan Evquarel Pebrian'),
    bio: 'Membantu publikasi, desain konten, dan dokumentasi kegiatan KSP.',
    socials: {},
    parentId: 'kominfo-koordinator',
  },
  {
    id: 'kominfo-jonathan-wilbert-andyna',
    nama: 'Jonathan Wilbert Andyna',
    slug: 'jonathan-wilbert-andyna',
    jabatan: 'Staf Kominfo',
    divisi: 'kominfo',
    angkatan: 2025,
    foto: portrait('Jonathan Wilbert Andyna'),
    bio: 'Membantu publikasi, desain konten, dan dokumentasi kegiatan KSP.',
    socials: {},
    parentId: 'kominfo-koordinator',
  },
  {
    ...PLACEHOLDER,
    id: 'usda-koordinator',
    slug: 'usda-koordinator',
    jabatan: 'Koordinator USDA',
    divisi: 'usda',
    bio: 'Koordinator divisi USDA KSP.',
    parentId: 'ph-ketua',
  },
  {
    ...PLACEHOLDER,
    id: 'usda-staf-1',
    slug: 'usda-staf-1',
    jabatan: 'Staf USDA',
    divisi: 'usda',
    bio: 'Staf divisi USDA KSP.',
    parentId: 'usda-koordinator',
  },
  {
    ...PLACEHOLDER,
    id: 'usda-staf-2',
    slug: 'usda-staf-2',
    jabatan: 'Staf USDA',
    divisi: 'usda',
    bio: 'Staf divisi USDA KSP.',
    parentId: 'usda-koordinator',
  },
  {
    ...PLACEHOLDER,
    id: 'usda-staf-3',
    slug: 'usda-staf-3',
    jabatan: 'Staf USDA',
    divisi: 'usda',
    bio: 'Staf divisi USDA KSP.',
    parentId: 'usda-koordinator',
  },
]
