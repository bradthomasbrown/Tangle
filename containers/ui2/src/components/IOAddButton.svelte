<script lang="ts">
    import IconButton from "@smui/icon-button/src/IconButton.svelte";
    import { Subreq } from '../stores/Subreq.mjs'
    function handleAdd() {
        Subreq.set([...$Subreq, {
            input: 0n,
            output: 0n,
            dest: undefined,
            work: 1000000000n,
            gas: 1000000000n
        }])
    }
</script>

<IconButton
    class="material-icons"
    on:click={handleAdd}
>
    add
</IconButton>