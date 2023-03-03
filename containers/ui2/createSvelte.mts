import { create } from 'create-svelte'

await create('app', {
    name: 'app',
    template: 'skeleton',
    types: 'typescript',
    prettier: false,
    eslint: false,
    playwright: false,
    vitest: false
})