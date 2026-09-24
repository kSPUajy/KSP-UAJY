/**
 * Compiles and runs every piece of C in the content directory.
 *
 *   node scripts/verify-c.mjs
 *
 * Two things are checked:
 *
 *   1. Every tentor snippet in `src/content/snippets/` compiles cleanly under
 *      `-std=c17 -Wall -Wextra -Werror` and runs to exit code 0.
 *   2. Every winning solution in `src/content/solutions/` compiles the same
 *      way, and for each of its challenge's sample I/O pairs, produces exactly
 *      the output written in `src/lib/data/challenges.ts`.
 *
 * The point of (2) is that the sample I/O on the site cannot quietly drift
 * away from the code shown next to it — if they disagree, this fails.
 */

import { execFile, execFileSync } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SNIPPETS = path.join(ROOT, 'src/content/snippets')
const SOLUTIONS = path.join(ROOT, 'src/content/solutions')
const CHALLENGES_TS = path.join(ROOT, 'src/lib/data/challenges.ts')

const CFLAGS = ['-std=c17', '-Wall', '-Wextra', '-Werror', '-O2']
const RUN_TIMEOUT_MS = 10_000

const green = (s) => `\u001b[32m${s}\u001b[0m`
const red = (s) => `\u001b[31m${s}\u001b[0m`
const dim = (s) => `\u001b[2m${s}\u001b[0m`

function findCompiler() {
  for (const candidate of ['gcc', 'cc', 'clang']) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' })
      return candidate
    } catch {
      // try the next one
    }
  }
  throw new Error('Tidak menemukan gcc, cc, atau clang di PATH.')
}

/**
 * Loads `challengeSources` without a TypeScript toolchain.
 *
 * The module is deliberately plain data — the only TypeScript in it is the
 * imports, one exported type alias, and one annotation. Stripping those three
 * leaves valid JavaScript. If the file ever grows real TypeScript, the import
 * below throws instead of silently skipping tests.
 */
async function loadChallenges() {
  const source = await readFile(CHALLENGES_TS, 'utf8')
  const js = source
    .replace(/^import .*$/gm, '')
    .replace(/^export type .*$/gm, '')
    .replace(/:\s*readonly\s+ChallengeSource\[\]/, '')

  const url = `data:text/javascript;base64,${Buffer.from(js, 'utf8').toString('base64')}`
  const mod = await import(url)

  if (!Array.isArray(mod.challengeSources)) {
    throw new Error('challengeSources tidak terbaca dari challenges.ts')
  }
  return mod.challengeSources
}

function compile(cc, source, output) {
  return new Promise((resolve) => {
    execFile(cc, [...CFLAGS, source, '-o', output], (error, _stdout, stderr) => {
      resolve({ ok: !error, stderr: stderr ?? '' })
    })
  })
}

function run(binary, cwd, input) {
  return new Promise((resolve) => {
    const child = execFile(
      binary,
      [],
      { cwd, timeout: RUN_TIMEOUT_MS, maxBuffer: 32 * 1024 * 1024 },
      (error, stdout, stderr) => {
        resolve({
          ok: !error,
          stdout: stdout ?? '',
          stderr: stderr ?? '',
          reason: error ? error.message : '',
        })
      },
    )
    if (input !== undefined) child.stdin.end(input)
    else child.stdin.end()
  })
}

/** Trailing whitespace on a line, and a trailing newline, never matter. */
function normalize(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n+$/, '')
}

function showDiff(expected, actual) {
  const e = expected.split('\n')
  const a = actual.split('\n')
  const rows = Math.max(e.length, a.length)
  const lines = []
  for (let i = 0; i < rows; i += 1) {
    const left = e[i] ?? '<tidak ada baris>'
    const right = a[i] ?? '<tidak ada baris>'
    const mark = left === right ? ' ' : '!'
    lines.push(`      ${mark} harap: ${JSON.stringify(left)}`)
    lines.push(`      ${mark} nyata: ${JSON.stringify(right)}`)
  }
  return lines.join('\n')
}

async function main() {
  const cc = findCompiler()
  const work = await mkdtemp(path.join(tmpdir(), 'ksp-c-'))
  const exe = (name) => path.join(work, process.platform === 'win32' ? `${name}.exe` : name)

  let failures = 0
  let compiled = 0
  let cases = 0

  console.log(dim(`compiler: ${cc} ${CFLAGS.join(' ')}`))
  console.log(dim(`workdir : ${work}\n`))

  // ---- 1. Tentor snippets ------------------------------------------------
  console.log('snippet tentor')
  const snippetFiles = (await readdir(SNIPPETS)).filter((f) => f.endsWith('.c')).sort()

  for (const file of snippetFiles) {
    const name = path.basename(file, '.c')
    const built = await compile(cc, path.join(SNIPPETS, file), exe(`snip-${name}`))
    if (!built.ok) {
      failures += 1
      console.log(`  ${red('GAGAL KOMPILASI')} ${name}\n${built.stderr}`)
      continue
    }
    compiled += 1

    const ran = await run(exe(`snip-${name}`), work)
    if (!ran.ok) {
      failures += 1
      console.log(`  ${red('GAGAL JALAN')} ${name} — ${ran.reason}`)
      continue
    }
    console.log(`  ${green('ok')} ${name}`)
  }

  // ---- 2. Winning solutions against their sample I/O ---------------------
  console.log('\nsolusi pemenang vs sample I/O')
  const challenges = await loadChallenges()

  for (const challenge of challenges) {
    if (!challenge.pemenangId) {
      console.log(`  ${dim('lewati')} minggu ${challenge.minggu} — ${challenge.slug} (masih terbuka)`)
      continue
    }

    const source = path.join(SOLUTIONS, `${challenge.pemenangId}.c`)
    if (!existsSync(source)) {
      failures += 1
      console.log(`  ${red('HILANG')} ${challenge.pemenangId}.c untuk ${challenge.slug}`)
      continue
    }

    const built = await compile(cc, source, exe(challenge.pemenangId))
    if (!built.ok) {
      failures += 1
      console.log(`  ${red('GAGAL KOMPILASI')} ${challenge.pemenangId}\n${built.stderr}`)
      continue
    }
    compiled += 1

    let allPassed = true
    for (const [index, sample] of challenge.sampleIO.entries()) {
      cases += 1
      const ran = await run(exe(challenge.pemenangId), work, `${sample.input}\n`)

      if (!ran.ok) {
        allPassed = false
        failures += 1
        console.log(
          `  ${red('GAGAL JALAN')} ${challenge.slug} contoh ${index + 1} — ${ran.reason}`,
        )
        continue
      }

      const expected = normalize(sample.output)
      const actual = normalize(ran.stdout)
      if (expected !== actual) {
        allPassed = false
        failures += 1
        console.log(`  ${red('KELUARAN BEDA')} ${challenge.slug} contoh ${index + 1}`)
        console.log(showDiff(expected, actual))
      }
    }

    if (allPassed) {
      console.log(
        `  ${green('ok')} minggu ${String(challenge.minggu).padStart(2, '0')} ${challenge.slug} ` +
          dim(`(${challenge.sampleIO.length} contoh)`),
      )
    }
  }

  await rm(work, { recursive: true, force: true }).catch(() => {})

  console.log('')
  console.log(`program dikompilasi : ${compiled}`)
  console.log(`contoh I/O diuji    : ${cases}`)

  if (failures > 0) {
    console.log(red(`\n${failures} kegagalan.`))
    process.exitCode = 1
    return
  }
  console.log(green('\nSemua kode C kompilasi bersih dan cocok dengan sample I/O-nya.'))
}

main().catch((error) => {
  console.error(red(`\nverify-c gagal: ${error.message}`))
  process.exitCode = 1
})
