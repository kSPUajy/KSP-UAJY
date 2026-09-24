// eslint-config-next 16 ships native flat configs, so no FlatCompat shim.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const config = [
  { ignores: ['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // eslint-config-next defaults this to 'detect', and the version sniffer in
    // eslint-plugin-react still calls context.getFilename(), which ESLint 10
    // removed. Pinning the version skips that code path entirely.
    settings: { react: { version: '19.3.0' } },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Motion's hook returns null on the server and the real preference on
      // the client's first render, so it hydrates the wrong markup for anyone
      // with reduced motion on. The project hook is hydration-safe.
      'no-restricted-imports': [
        'error',
        {
          paths: ['motion/react', 'framer-motion'].map((name) => ({
            name,
            importNames: ['useReducedMotion'],
            message: "Use useReducedMotion from '@/lib/hooks/useReducedMotion' instead.",
          })),
        },
      ],
    },
  },
]

export default config
