<script lang="ts">
import chains from '@/json/chains.json' assert { type: "json" }

export default {
    data() { return { chains: chains } },
    props: ['name', 'focusout', 'selected', 'i'],
    methods: {
        addActive(e: Event) {
            e.target['classList'].add('active')
        },
        removeActive(e: Event) {
            e.target['classList'].remove('active')
        },
        click() {
            if (this.i > 0)
                this.$emit('selectedChange', {
                    selected: this.name
                })
        }
    },
    computed: {
        chainKnown() {
            return Object.keys(this.chains).indexOf(this.name) != -1
        }
    }
}
</script>

<template class="foo">
    <button
        class="chain"
        @mousedown.stop="addActive"
        @keydown.enter.stop="addActive"
        @keydown.space.stop="addActive"
        @touchstart.passive="addActive"
        @mouseup.stop="removeActive"
        @mouseleave.stop="removeActive"
        @keyup.enter.stop="removeActive"
        @keyup.space.stop="removeActive"
        @focusout="focusout"
        @click="click"
    >
        <div class="chain-logo-container">
            <img v-if="chainKnown" class="chain-logo" :src="`${chains[name].chainAbbreviation.replace('-t', '')}-logo.svg`">
            <span v-if="!chainKnown" class="chain-logo">?</span>
        </div>
        <div class="chain-abbreviation">
            {{ chainKnown ? chains[name].chainAbbreviation : name }}
        </div>
        <span
            v-show="name == selected"
            class="material-symbols-outlined"
        >
            expand_more
        </span>
        <slot></slot>
    </button>
</template>

<style scoped>

button {
    position: relative;
    z-index: 1;
    display: flex;
    padding: 0px;
    background-color: rgb(59, 40, 46);
    flex: 1;
    min-width: 250px;
    align-items: center;
    border-radius: 12px;
    border: none;
    height: 100%;
    cursor: pointer;
    color: #f5f5ff;
    gap: 10px;
    outline: none;
}

button:hover, button:focus {
    background: rgb(51, 31, 37);
    box-shadow: 0px 0px 0px 0px rgba(255, 255, 255, 0.055);
    scale: 1;
    transition: scale 150ms cubic-bezier(0.075, 0.82, 0.165, 1);
}

button.active {
    background: rgb(34, 17, 22);
    box-shadow: 0px 0px 20px 20px rgba(255, 255, 255, 0);
    scale: 0.9875;
    transition: box-shadow 500ms cubic-bezier(0.075, 0.82, 0.165, 1), scale 150ms cubic-bezier(0.075, 0.82, 0.165, 1);
}

button.active .options {
    scale: calc(1 / 0.9875);
    transition: scale 150ms cubic-bezier(0.075, 0.82, 0.165, 1);
}

.chain-logo-container {
    background-color: #f5f5ff;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    pointer-events: none;
    margin: 5px 0px 5px 15px;
    color: black;
    font-size: 32px;
    font-family: 'Plus Jakarta Sans', sans-serif;
}

.chain-logo {
    height: 29px;
    width: auto;
    pointer-events: none;
    pointer-events: none;
}

.chain-abbreviation {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 20px;
    flex: 1;
    text-align: left;
    pointer-events: none;
}

span.material-symbols-outlined {
    font-size: 48px;
    pointer-events: none;
    margin-right: 15px;
}

span {
    display: flex;
    align-items: center;
}

</style>