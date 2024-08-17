import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    main: 'src/main.ts',
  },
  target: 'es2020',
  format: 'cjs',
  sourcemap: false,
  dts: false,
  platform: 'node',
})
