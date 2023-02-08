<script lang="ts">
import IO from './IO.vue'
export default {
    components: { IO },
    data() {
        return {
            from: 'eth',
            chains: ['eth', 'bsc', 'avax', 'ftm'],
        }
    },
    methods: {
        fromChange(e: string) {
            this.from = e
        },
        addActive(e: Event) {
            e.target['classList'].add('active')
        },
        removeActive(e: Event) {
            e.target['classList'].remove('active')
        }
    }
}
</script>

<template>
    <div id="body">
        <button class="primary-btn"
            @mousedown.stop="addActive"
            @keydown.enter.stop="addActive"
            @keydown.space.stop="addActive"
            @touchstart="addActive"
            @mouseup.stop="removeActive"
            @mouseleave.stop="removeActive"
            @keyup.enter.stop="removeActive"
            @keyup.space.stop="removeActive"
        >
            Swap
        </button>
        <IO :chains="chains.filter(chain => chain != from)"/>
        <IO :chains="chains" :type="'from'" @fromChange="fromChange"/>
    </div>
</template>

<style scoped>

#body {
    padding: 50px 31px;
    display: flex;
    align-items: center;
    flex-direction: column-reverse;
    gap: 25px;
}

#switch-container {
    display: flex;
    justify-content: center;
    margin: 5px 0px;
}

#switch {
    outline: none;
    background-color: transparent;
    border: none;
    cursor: pointer;
}

#swap-container {
    margin-top: 20px;
}

</style>