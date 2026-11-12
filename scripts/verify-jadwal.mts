// Self-check for tukarSlot: moving Games up from after Prosedur 1 to after
// Pemilihan (the 2026-11-12 change) must give each module the next week.
// Run: npx tsx scripts/verify-jadwal.mts
import assert from 'node:assert/strict'

import { addDays } from '../src/lib/format'
import { tukarSlot } from '../src/lib/jadwal'
import type { SlotJadwal } from '../src/lib/jadwal'

let items: SlotJadwal[] = [
  { jenis: 'modul', id: 'mod-04', judul: 'Pemilihan', senin: '2026-11-02' },
  { jenis: 'modul', id: 'mod-05', judul: 'Perulangan 1', senin: '2026-11-09' },
  { jenis: 'modul', id: 'mod-06', judul: 'Perulangan 2', senin: '2026-11-16' },
  { jenis: 'modul', id: 'mod-07', judul: 'Prosedur 1', senin: '2026-11-23' },
  { jenis: 'sesi', id: 'games', judul: 'Games', senin: '2026-11-30' },
  { jenis: 'sesi', id: 'review', judul: 'Review Materi', senin: '2027-02-22' },
]

for (let step = 0; step < 3; step += 1) {
  const plan = tukarSlot(items, 'games', -1)
  assert.ok(plan.ok, plan.ok ? '' : plan.error)
  for (const { item, hari } of plan.geser) items = items.map((row) => (row.id === item.id ? { ...row, senin: addDays(row.senin, hari) } : row))
}
const senin = Object.fromEntries(items.map((row) => [row.id, row.senin]))
assert.deepEqual(senin, {
  'mod-04': '2026-11-02',
  games: '2026-11-09',
  'mod-05': '2026-11-16',
  'mod-06': '2026-11-23',
  'mod-07': '2026-11-30',
  review: '2027-02-22',
})

assert.equal(tukarSlot(items, 'mod-06', -1).ok, false, 'two modules never swap')
assert.equal(tukarSlot(items, 'mod-04', -1).ok, false, 'the first item cannot go up')
assert.equal(tukarSlot([...items, { jenis: 'sesi', id: 'x', judul: 'X', senin: '2026-11-09' }], 'x', -1).ok, false, 'same week')
console.log('verify-jadwal: ok')
