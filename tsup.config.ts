import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    main: 'src/main.ts',
  },
  target: 'es2020',
  format: 'cjs',
  sourcemap: false,
  dts: false,
  clean: true,
  platform: 'node',
  // bundle all dependencies
  noExternal: [
    '@actions/core',
    '@actions/exec',
    '@actions/http-client',
    '@actions/tool-cache',
    'semver',
  ]
})
