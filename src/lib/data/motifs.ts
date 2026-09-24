import 'server-only'

/**
 * The C that the site wears as texture: the ticker between sections and the
 * dim field that drifts behind the hero. Both are decorative and hidden from
 * assistive tech, but they are still words the club chose, so they live with
 * the rest of the content rather than inside a component.
 *
 * Keep entries short — a ticker token longer than ~20 characters stops
 * reading as a token.
 */

export const tickerTokens: readonly string[] = [
  'malloc',
  'free',
  'NULL',
  'struct',
  '->next',
  'sizeof',
  '0xDEADBEEF',
  '*(p + i)',
  'realloc',
  'typedef',
  '&x',
  'void *',
  'EOF',
  'argc, argv',
  "'\\0'",
  'x >> 1',
  'gcc -Wall',
  'return 0;',
]

/** Pointers, addresses, and the fragments you stare at while debugging. */
export const driftTokens: readonly string[] = [
  '0x7ffd5c1e',
  'NULL',
  '->next',
  '0xDEADBEEF',
  '*p++',
  'sizeof(Node)',
  '0x00c0ffee',
  'free(tmp);',
  '&arr[0]',
  'char **argv',
  '0x55d4a1b0',
  "'\\0'",
  'malloc(n)',
  'p != NULL',
  '0xfeedface',
  'x ^= y',
  '%zu',
  'SIGSEGV',
  '0x0040a2c8',
  '(void *)',
  'i < n',
  'static',
  '0x1badb002',
  'EOF',
]
