<script lang="ts">
    import { Panel } from '@smui-extra/accordion'
    import SubreqHeader from './SubreqHeader.svelte';
    import SubreqContent from './SubreqContent.svelte';
    // import Subreq from '../classes/Subreq.mjs';
    // export let subreqs: Subreq[]
    // export let index: number
    export let style: string
    let invalid = true
    // $: {
    //     let subreq = subreqs[index]
    //     if (!subreq) invalid = true
    //     else {
    //         let { input, output, dest, gas, work } = subreq
    //         if (input === 0n
    //         || typeof input !== 'bigint'
    //         || output === 0n
    //         || typeof output !== 'bigint'
    //         || dest === undefined
    //         || typeof gas !== 'bigint'
    //         || work === 0n
    //         || typeof work !== 'bigint')
    //             invalid = true
    //         else invalid = false 
    //     }
    // }
</script>

<Panel style={style} variant="outlined" color={invalid ? 'invalid' : ''}>
    <!-- <SubreqHeader bind:subreqs bind:index/>
    <SubreqContent bind:subreqs bind:index/> -->
</Panel>