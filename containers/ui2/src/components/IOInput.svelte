<script lang="ts">
    import Textfield from '@smui/textfield'
    import { Subreq } from '../stores/Subreq.mjs'
    export let subreq: Subreq
    let input = `${subreq.input}`
    function handleInput() {
        try {
            let valueStr = input
            let index = valueStr.indexOf('.')
            let nodot = valueStr.replace('.', '')
            let value = BigInt(nodot) * 10n ** 18n
                / (index == -1
                    ? 1n
                    : 10n ** BigInt(nodot.length - index))
            subreq.input = value
        } catch (e) { subreq.input = undefined }
        subreq = subreq
    }
</script>

<Textfield
    invalid={!subreq.input}
    on:input={handleInput}
    bind:value={input}
    label="Input"
>
</Textfield>