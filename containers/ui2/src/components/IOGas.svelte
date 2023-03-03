<script lang="ts">
    import Textfield from '@smui/textfield'
    import { Subreq } from '../stores/Subreq.mjs'
    export let subreq: Subreq
    let gas = `${subreq.gas}`
    function handleInput() {
        try {
            if (gas === '') throw ''
            let value = BigInt(gas)
            subreq.gas = value
        } catch (e) { subreq.gas = undefined }
        subreq = subreq
    }
</script>

<Textfield
    invalid={subreq.gas === undefined}
    on:input={handleInput}
    bind:value={gas}
    label="Gas"
>
</Textfield>