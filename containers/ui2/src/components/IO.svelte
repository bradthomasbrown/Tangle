<script lang="ts">
    import Panel from '@smui-extra/accordion/src/Panel.svelte';
    import IOHeader from './IOHeader.svelte'
    import IOBody from './IOBody.svelte'
    import { Subreq } from '../stores/Subreq.mjs'
    export let subreq: Subreq
    $: zIndex = $Subreq.length - $Subreq.indexOf(subreq)
    $: invalid =
        !subreq.input
        || !subreq.output 
        || !subreq.dest 
        || subreq.gas === undefined
        || !subreq.work
</script>

<Panel
    color={invalid ? "invalid" : ""}
    variant="outlined"
    style={`z-index: ${zIndex}`}
>
    <IOHeader bind:subreq/>
    <IOBody bind:subreq/>
</Panel>