import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  externals: [
    'vscode',
  ],
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
})
