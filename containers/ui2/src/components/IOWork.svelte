<script lang="ts">
    import Textfield from '@smui/textfield'
    import { Subreq } from '../stores/Subreq.mjs'
    export let subreq: Subreq
    let work = `${subreq.work}`
    function handleInput() {
        try {
            if (work === '') throw ''
            let value = BigInt(work)
            subreq.work = value
        } catch (e) { subreq.work = undefined }
        subreq = subreq
    }
</script>

<Textfield
    invalid={!subreq.work}
    on:input={handleInput}
    bind:value={work}
    label="Work"
>
</Textfield>