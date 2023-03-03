<script lang="ts">
    import IconButton from "@smui/icon-button/src/IconButton.svelte";
    import { Subreq } from '../stores/Subreq.mjs'
    export let subreq: Subreq
    $: index = $Subreq.indexOf(subreq)
    function handleDelete() {
        Subreq.update(state => {
            return state =
                [...state.slice(0, index), ...state.slice(index + 1)]
        })
    }
</script>

<IconButton
    class="material-icons"
    size="button"
    on:click={handleDelete}
>
    delete
</IconButton>