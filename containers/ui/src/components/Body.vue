<script setup lang="ts">
import { ref } from 'vue';
import { Web3Provider } from '@ethersproject/providers'
let active = ref(false)
let hover = ref(false)
let focus = ref(false)
let action = (e: Event) => {
    if (e.type == 'mousedown') active.value = true
    if (e.type == 'mouseup') active.value = false
    if (e.type == 'mouseleave') { hover.value = false; active.value = false }
    if (e.type == 'mouseover') hover.value = true
    if (e.type == 'keydown') active.value = true
    if (e.type == 'keyup') active.value = false
    if (e.type == 'focusin') focus.value = true
    if (e.type == 'focusout') focus.value = false
    if (e.type == 'touchstart') active.value = true
    if (e.type == 'touchend') active.value = false
}
let click = async () => {
    
}
</script>

<template>
    <div id="body">
        <div class="input-container">
            <div class="input-container-header">
                <div>From</div>
                <div class="filler"></div>
                <div>
                    Balance
                    <span class="numeric">0.0000000000</span>
                </div>
            </div>
            <div class="input-container-body">
                <div class="input-container-body-object">
                    <input>
                    <div class="line"></div>
                </div>
                <div class="input-container-body-object">
                    <button class="chain">
                        <img src="favicon.ico">
                        bottom text lmao V
                    </button>
                </div>
            </div>
        </div>
        <div id="switch-container">
            <button id="switch">
                <span class="material-symbols-outlined">autorenew</span>
            </button>
        </div>
        <div class="input-container">
            <div class="input-container-header">
                To
            </div>
        </div>
        <div id="swap-container">
            <button
                type="button"
                id="swap"
                :class="`` +
                `primary-btn` +
                `${active ? ' active': ''}` +
                `${hover || focus ? ' hover': ''}` +
                ``"
                @mousedown="action"
                @mouseup="action"
                @mouseleave="action"
                @mouseover="action"
                @keydown.enter="action" 
                @keyup.enter="action"
                @focusin="action"
                @focusout="action"
                @touchstart="action"
                @touchend="action"
                @click="click"
            >
                Swap
            </button>
        </div>
        
    </div>
</template>

<style scoped>

#body {
    padding: 50px 31px;
    display: flex;
    align-items: center;
    flex-direction: column;
}

.input-container {
    display: flex;
    flex-direction: column;
    background-color: #2E2E2E;
    color: #f5f5ff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    border-radius: 12px;
    width: 100%;
    padding: 12.5px 0px;
    gap: 10px;
}

.input-container-header {
    padding: 0px 12.5px;
    display: flex;
    align-items: center;
}

.filler {
    flex: 1;
}

.numeric {
    margin-left: 5px;
    font-family: monospace;
    font-size: 16px;
}

#switch-container {
    display: flex;
    justify-content: center;
    margin: 5px 0px;
}

#switch {
    background-color: transparent;
    border: none;
    cursor: pointer;
}

#swap-container {
    margin-top: 20px;
    width: 120px;
}

#swap {
    display: block;
    width: 100%;
}

.input-container-body {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 0px 12px;
}

.input-container-body-object {
    display: flex;
    flex-direction: column;
    background-color: #393939;
    flex: 1;
    min-width: 250px;
    border-radius: 12px;
}

input {
    background-color: transparent;
    border: none;
    outline: none;
    height: 100%;
    font-size: 24px;
    font-family: monospace;
    color: #f5f5ff;
    margin: 9px 15px 0px 15px;
}

.line {
    height: 2px;
    background-color: #f5f5ff80;
    margin: 0px 15px 13px 15px;
}

.chain {
    display: flex;
    align-items: center;
    border-radius: 12px;
    border: none;
    height: 100%;
    width: auto;
    cursor: pointer;
    background-color: transparent;
    color: #f5f5ff;
    margin: 13px 10px 13px 10px;
}

</style>