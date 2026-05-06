import { defineConfig } from 'vitest/config'
import path from 'path'

// Note: @vitejs/plugin-react is NOT required for pure-function unit tests.
// Only add it back if you write component tests that render JSX.
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/components/ui/', '.next/', 'scripts/'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
