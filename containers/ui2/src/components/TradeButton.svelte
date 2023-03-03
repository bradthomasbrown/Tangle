<script lang="ts">
    import Button from "@smui/button/src/Button.svelte";
    import { Subreq } from '../stores/Subreq.mjs'
    $: disabled = $Subreq.map(subreq => !subreq.input
        || !subreq.output 
        || !subreq.dest 
        || subreq.gas === undefined
        || !subreq.work)
        .reduce((p, c) => p || c)
</script>

<Button disabled={disabled} variant="unelevated">Trade</Button>