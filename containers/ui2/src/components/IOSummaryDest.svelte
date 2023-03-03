<script lang="ts">
    import { Subreq } from '../stores/Subreq.mjs'
    // @ts-ignore
    import chains from '../json/chains.json'
    export let subreq: Subreq
    $: dest = subreq && subreq.dest ? chains[subreq.dest]?.chainAbbreviation
        ?? '?' : '?'
</script>

{dest}