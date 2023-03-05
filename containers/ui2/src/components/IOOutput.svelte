<script lang="ts">
    import Textfield from '@smui/textfield'
    import { Subreq } from '../stores/Subreq.mjs'
    export let subreq: Subreq
    let output = `${subreq.output}`
    function handleInput() {
        try {
            let valueStr = output.replace(/ /g, '')
            let index = valueStr.indexOf('.')
            let nodot = valueStr.replace('.', '')
            let value = BigInt(nodot) * 10n ** 18n
                / (index == -1
                    ? 1n
                    : 10n ** BigInt(nodot.length - index))
            subreq.output = value
        } catch (e) { subreq.output = undefined }
        subreq = subreq
    }
</script>

<Textfield
    invalid={!subreq.output}
    on:input={handleInput}
    bind:value={output}
    label="Output"
/>