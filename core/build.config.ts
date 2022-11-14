import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    clean: true,
    entries: ['./src/index'],
    rollup: {
        emitCJS: true,
    },
    declaration: true
})