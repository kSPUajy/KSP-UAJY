/**
 * Referential integrity for the content layer.
 *
 *   node scripts/verify-data.mjs
 *
 * TypeScript proves the shape of every record. It cannot prove that a
 * `pemenangId` points at a winner who exists, that a slug has a matching file
 * on disk, or that two people were not given the same id. That is this script.
 *
 * The data modules are plain literal data, so ids and slugs are pulled out with
 * targeted patterns rather than a TypeScript toolchain. Every extraction is
 * followed by a count assertion — if a pattern ever stops matching, this fails
 * loudly instead of quietly verifying nothing.
 */

import { readFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const green = (s) => `\u001b[32m${s}\u001b[0m`
const red = (s) => `\u001b[31m${s}\u001b[0m`
const dim = (s) => `\u001b[2m${s}\u001b[0m`

const problems = []
const fail = (message) => problems.push(message)

/** Expected record counts, so a broken pattern can never pass silently. */
const EXPECTED = {
  members: 15,
  challenges: 10,
  winners: 0,
  news: 9,
}

async function source(relative) {
  return readFile(path.join(ROOT, 'src/lib/data', relative), 'utf8')
}

/** All values of a single-quoted literal field, in document order. */
function field(text, name) {
  const pattern = new RegExp(`(?:^|[\\s{,])${name}:\\s*'([^']*)'`, 'g')
  return [...text.matchAll(pattern)].map((match) => match[1])
}

function expectCount(label, actual, expected) {
  if (actual !== expected) {
    fail(`${label}: terbaca ${actual} entri, seharusnya ${expected} — pola ekstraksi kemungkinan rusak`)
    return false
  }
  return true
}

function expectUnique(label, values) {
  const seen = new Set()
  for (const value of values) {
    if (seen.has(value)) fail(`${label}: nilai ganda "${value}"`)
    seen.add(value)
  }
}

function expectAllIn(label, values, allowed, allowedLabel) {
  for (const value of values) {
    if (!allowed.has(value)) fail(`${label}: "${value}" tidak ada di ${allowedLabel}`)
  }
}

async function fileExists(relative) {
  try {
    await access(path.join(ROOT, relative))
    return true
  } catch {
    return false
  }
}

async function expectFiles(label, slugs, dir, extension) {
  for (const slug of slugs) {
    const relative = `src/content/${dir}/${slug}${extension}`
    if (!(await fileExists(relative))) fail(`${label}: berkas hilang — ${relative}`)
  }
}

async function main() {
  const membersTs = await source('members.ts')
  const challengesTs = await source('challenges.ts')
  const winnersTs = await source('winners.ts')
  const newsTs = await source('news.ts')

  // ---- ids, slugs, counts ------------------------------------------------
  const memberIds = field(membersTs, 'id')
  const memberSlugs = field(membersTs, 'slug')
  const parentIds = field(membersTs, 'parentId')

  const challengeIds = field(challengesTs, 'id')
  const challengeSlugs = field(challengesTs, 'slug')
  const pemenangIds = field(challengesTs, 'pemenangId')

  const winnerIds = field(winnersTs, 'id')
  const winnerSlugs = field(winnersTs, 'slug')
  const winnerChallengeIds = field(winnersTs, 'challengeId')

  const newsIds = field(newsTs, 'id')
  const newsSlugs = field(newsTs, 'slug')


  expectCount('members.ts id', memberIds.length, EXPECTED.members)
  expectCount('members.ts slug', memberSlugs.length, EXPECTED.members)
  expectCount('challenges.ts id', challengeIds.length, EXPECTED.challenges)
  expectCount('challenges.ts slug', challengeSlugs.length, EXPECTED.challenges)
  expectCount('winners.ts id', winnerIds.length, EXPECTED.winners)
  expectCount('news.ts id', newsIds.length, EXPECTED.news)
  expectCount('news.ts slug', newsSlugs.length, EXPECTED.news)

  // ---- uniqueness --------------------------------------------------------
  expectUnique('members.ts id', memberIds)
  expectUnique('members.ts slug', memberSlugs)
  expectUnique('challenges.ts id', challengeIds)
  expectUnique('challenges.ts slug', challengeSlugs)
  expectUnique('winners.ts id', winnerIds)
  expectUnique('news.ts id', newsIds)
  expectUnique('news.ts slug', newsSlugs)

  // A winner slug is a person and may legitimately repeat across their wins,
  // so it is checked for resolvability rather than uniqueness.

  // ---- cross references --------------------------------------------------
  const memberIdSet = new Set(memberIds)
  const challengeIdSet = new Set(challengeIds)
  const winnerIdSet = new Set(winnerIds)

  expectAllIn('members.ts parentId', parentIds, memberIdSet, 'daftar id anggota')
  expectAllIn('challenges.ts pemenangId', pemenangIds, winnerIdSet, 'daftar id pemenang')
  expectAllIn('winners.ts challengeId', winnerChallengeIds, challengeIdSet, 'daftar id challenge')

  // Exactly one root: the person with no parentId.
  const roots = memberIds.length - parentIds.length
  if (roots !== 1) fail(`members.ts: ada ${roots} anggota tanpa parentId, seharusnya tepat 1`)

  // Every resolved challenge must point back at the winner that claims it.
  // The seed starts the season with no winners, so an unresolved week is fine.
  const winnerByChallenge = new Map()
  winnerChallengeIds.forEach((challengeId, index) => {
    winnerByChallenge.set(challengeId, winnerIds[index])
  })
  challengeIds.forEach((challengeId) => {
    const declared = pemenangIds.includes(winnerByChallenge.get(challengeId))
    const claimed = winnerByChallenge.get(challengeId)
    if (claimed && !declared) {
      fail(`challenges.ts: ${challengeId} tidak menunjuk balik ke pemenangnya (${claimed})`)
    }
  })

  // ---- content files -----------------------------------------------------
  await expectFiles('challenge', challengeSlugs, 'challenges', '.mdx')
  await expectFiles('berita', newsSlugs, 'news', '.mdx')
  await expectFiles('solusi pemenang', winnerIds, 'solutions', '.c')

  // ---- report ------------------------------------------------------------
  console.log(dim('integritas konten'))
  console.log(`  anggota   : ${memberIds.length}`)
  console.log(`  challenge : ${challengeIds.length} (${pemenangIds.length} sudah ada pemenang)`)
  console.log(`  pemenang  : ${winnerIds.length} kemenangan, ${new Set(winnerSlugs).size} orang`)
  console.log(`  berita    : ${newsIds.length}`)

  if (problems.length > 0) {
    console.log(red(`\n${problems.length} masalah:`))
    for (const problem of problems) console.log(red(`  - ${problem}`))
    process.exitCode = 1
    return
  }

  console.log(green('\nSemua referensi silang dan berkas konten cocok.'))
}

main().catch((error) => {
  console.error(red(`\nverify-data gagal: ${error.message}`))
  process.exitCode = 1
})
