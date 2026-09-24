/**
 * A small C tokenizer.
 *
 * Written by hand rather than pulled from Shiki for two reasons: the colours
 * have to be OUR tokens so they follow the theme and the section accent, and a
 * C-only lexer is genuinely simple. It runs at build time inside a server
 * component, so highlighted code costs zero client JavaScript.
 *
 * It is a lexer, not a parser — good enough to colour real code, and it never
 * throws on input it does not understand.
 */

export type CTokenType =
  | 'preproc'
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'type'
  | 'func'
  | 'punct'
  | 'ident'
  | 'plain'

export type CToken = {
  type: CTokenType
  value: string
}

const KEYWORDS = new Set([
  'auto', 'break', 'case', 'const', 'continue', 'default', 'do', 'else', 'enum',
  'extern', 'for', 'goto', 'if', 'inline', 'register', 'restrict', 'return',
  'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'volatile',
  'while', '_Alignas', '_Alignof', '_Atomic', '_Generic', '_Noreturn',
  '_Static_assert', '_Thread_local',
])

const TYPES = new Set([
  'char', 'double', 'float', 'int', 'long', 'short', 'signed', 'unsigned',
  'void', 'bool', '_Bool', '_Complex', 'wchar_t',
  'size_t', 'ssize_t', 'ptrdiff_t', 'intptr_t', 'uintptr_t',
  'int8_t', 'int16_t', 'int32_t', 'int64_t',
  'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t',
  'clock_t', 'time_t', 'va_list', 'FILE',
])

/** Constants and standard streams read as literals, so they share that colour. */
const CONSTANTS = new Set([
  'NULL', 'EOF', 'true', 'false',
  'stdin', 'stdout', 'stderr',
  'INT_MAX', 'INT_MIN', 'UINT_MAX', 'LONG_MAX', 'LONG_MIN',
  'CHAR_BIT', 'SIZE_MAX', 'RAND_MAX', 'BUFSIZ',
  'EXIT_SUCCESS', 'EXIT_FAILURE',
])

const PUNCTUATION = new Set('{}()[];,.<>+-*/%=!&|^~?:#'.split(''))

const isDigit = (ch: string): boolean => ch >= '0' && ch <= '9'
const isHexDigit = (ch: string): boolean =>
  isDigit(ch) || (ch >= 'a' && ch <= 'f') || (ch >= 'A' && ch <= 'F')
const isIdentStart = (ch: string): boolean =>
  (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_'
const isIdentPart = (ch: string): boolean => isIdentStart(ch) || isDigit(ch)

/** True when only horizontal whitespace separates `index` from the line start. */
function atLineStart(source: string, index: number): boolean {
  for (let i = index - 1; i >= 0; i -= 1) {
    const ch = source.charAt(i)
    if (ch === '\n') return true
    if (ch !== ' ' && ch !== '\t') return false
  }
  return true
}

export function tokenizeC(source: string): CToken[] {
  const tokens: CToken[] = []
  const length = source.length

  let plain = ''
  const flushPlain = (): void => {
    if (plain) {
      tokens.push({ type: 'plain', value: plain })
      plain = ''
    }
  }
  const push = (type: CTokenType, value: string): void => {
    flushPlain()
    tokens.push({ type, value })
  }

  let i = 0
  while (i < length) {
    const ch = source.charAt(i)

    // Preprocessor directive — swallowed whole, including line continuations,
    // so `#include <stdio.h>` stays one violet run.
    if (ch === '#' && atLineStart(source, i)) {
      let j = i
      while (j < length) {
        if (source.charAt(j) === '\\' && source.charAt(j + 1) === '\n') {
          j += 2
          continue
        }
        if (source.charAt(j) === '\n') break
        j += 1
      }
      push('preproc', source.slice(i, j))
      i = j
      continue
    }

    if (source.startsWith('/*', i)) {
      const end = source.indexOf('*/', i + 2)
      const stop = end === -1 ? length : end + 2
      push('comment', source.slice(i, stop))
      i = stop
      continue
    }

    if (source.startsWith('//', i)) {
      const newline = source.indexOf('\n', i)
      const stop = newline === -1 ? length : newline
      push('comment', source.slice(i, stop))
      i = stop
      continue
    }

    // String and character literals share a colour, as they do in most IDEs.
    if (ch === '"' || ch === "'") {
      let j = i + 1
      while (j < length) {
        const c = source.charAt(j)
        if (c === '\\') {
          j += 2
          continue
        }
        if (c === ch) {
          j += 1
          break
        }
        if (c === '\n') break
        j += 1
      }
      push('string', source.slice(i, j))
      i = j
      continue
    }

    if (isDigit(ch) || (ch === '.' && isDigit(source.charAt(i + 1)))) {
      let j = i
      const next = source.charAt(i + 1)
      if (ch === '0' && (next === 'x' || next === 'X')) {
        j = i + 2
        while (j < length && isHexDigit(source.charAt(j))) j += 1
      } else {
        while (j < length && (isDigit(source.charAt(j)) || source.charAt(j) === '.')) j += 1
        const exponent = source.charAt(j)
        if (exponent === 'e' || exponent === 'E') {
          j += 1
          const sign = source.charAt(j)
          if (sign === '+' || sign === '-') j += 1
          while (j < length && isDigit(source.charAt(j))) j += 1
        }
      }
      // Width and signedness suffixes: 10UL, 1.5f, 3LL
      while (j < length && 'uUlLfF'.includes(source.charAt(j))) j += 1
      push('number', source.slice(i, j))
      i = j
      continue
    }

    if (isIdentStart(ch)) {
      let j = i
      while (j < length && isIdentPart(source.charAt(j))) j += 1
      const word = source.slice(i, j)

      let type: CTokenType
      if (KEYWORDS.has(word)) {
        type = 'keyword'
      } else if (TYPES.has(word)) {
        type = 'type'
      } else if (CONSTANTS.has(word)) {
        type = 'number'
      } else {
        // An identifier immediately followed by `(` is being called.
        let k = j
        while (k < length && (source.charAt(k) === ' ' || source.charAt(k) === '\t')) k += 1
        type = source.charAt(k) === '(' ? 'func' : 'ident'
      }

      push(type, word)
      i = j
      continue
    }

    if (PUNCTUATION.has(ch)) {
      push('punct', ch)
      i += 1
      continue
    }

    plain += ch
    i += 1
  }

  flushPlain()
  return tokens
}

/**
 * Regroups tokens into one array per source line, splitting any token that
 * spans a newline (block comments, directives, runs of whitespace).
 *
 * The line-number gutter needs real lines, and doing the split here keeps the
 * rendering component free of string handling.
 */
export function tokenizeCLines(source: string): CToken[][] {
  const normalized = source.replace(/\r\n/g, '\n').replace(/\s+$/, '')
  const lines: CToken[][] = [[]]

  for (const token of tokenizeC(normalized)) {
    const parts = token.value.split('\n')
    parts.forEach((part, index) => {
      if (index > 0) lines.push([])
      if (!part) return
      const current = lines[lines.length - 1]
      current?.push({ type: token.type, value: part })
    })
  }

  return lines
}

export const SYNTAX_CLASS: Record<CTokenType, string> = {
  preproc: 'text-syn-preproc',
  comment: 'text-syn-comment italic',
  string: 'text-syn-string',
  number: 'text-syn-number',
  keyword: 'text-syn-keyword',
  type: 'text-syn-type',
  func: 'text-syn-func',
  punct: 'text-syn-punct',
  ident: 'text-syn-ident',
  plain: '',
}
