import { writable, get, type Writable } from 'svelte/store'
// @ts-ignore
import { browser } from '$app/environment'
import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers6'
// @ts-ignore
import { abi, address } from '../json/tngl.json'
import { onDestroy } from 'svelte/internal'

interface Web3 {
    ethereum?: any;
    selectedAddress?: string;
    chainId?: string;
    provider?: BrowserProvider;
    signer?: JsonRpcSigner;
    contracts?: { [key: string]: Contract };
    balances?: { [key: string]:
        { [key: string]: { balance?: bigint, timestamp?: Number } }};
    block?: Number;
    pendingTxs?: any[];
    failedTxs?: any[];
    successfulTxs?: any[];
}
let Web3: Writable<Web3> = writable({});
function assignToWeb3State(source: Web3) {
    Web3.update(state => Object.assign(state, source))
}
(async () => {
    if (!browser) return
    let { ethereum } = window
    if (!ethereum) return
    Web3.update(state => { state.ethereum = ethereum; return state })
    ethereum.on('chainChanged', handleChainChanged)
    ethereum.on('accountsChanged', handleAccountsChanged)
    let { chainId, selectedAddress } = ethereum
    assignToWeb3State({ chainId, selectedAddress })
    updateProvider()
    function handleChainChanged(chainId: string) {
        assignToWeb3State({ chainId })
        updateProvider()
    }
    function updateProvider() {
        let provider = new BrowserProvider(ethereum)
        assignToWeb3State({ provider })
        updateSigner()
        // updateBlock()
    }
    function handleAccountsChanged(selectedAddress: string) {
        selectedAddress = selectedAddress[0]
        assignToWeb3State({ selectedAddress })
        updateSigner()
    }
    async function updateSigner() {
        let { provider, selectedAddress } = get(Web3)
        let signer = selectedAddress ? await provider.getSigner() : undefined
        assignToWeb3State({ signer })
        updateContracts()
        // updateTangle()
    }
    async function updateContracts() {
        let { provider, signer, contracts } = get(Web3)
        if (!contracts) {
            contracts = {}
            assignToWeb3State({ contracts })
        }
        let tangle = new Contract(address, abi, signer ?? provider)
        let code = await tangle.getDeployedCode()
        if (!code || code === '0x') tangle = undefined
        contracts.tangle = tangle
        assignToWeb3State({})
        updateBalances()
    }
    async function updateBalances() {
        let { block, balances, contracts, selectedAddress,
            provider } = get(Web3)
        let network = await provider.getNetwork()
            .catch(() => { return undefined })
        if (network) {
            let chainId = `0x${network.chainId.toString(16)}`
            if (!balances) {
                balances = {}
                assignToWeb3State({ balances: {} })
            }
            if (!balances[chainId]) balances[chainId] = {}
            if (!contracts) {
                contracts = {}
                assignToWeb3State({ contracts: {} })
            }
            Object.entries(contracts).forEach(async entry => {
                let [name, contract] = entry
                let contractBalance =
                    await contract?.balanceOf(selectedAddress)
                    .catch(() => { return undefined })
                if (contractBalance !== undefined) {
                    if (!balances[chainId][name]) balances[chainId][name] = {}
                    balances[chainId][name].timestamp = block
                    balances[chainId][name].balance = contractBalance
                }
            })
            let nativeBalance = await provider.getBalance(selectedAddress)
                .catch(() => { return undefined })
            if (nativeBalance !== undefined) {
                if (!balances[chainId].native) balances[chainId].native = {}
                balances[chainId].native.timestamp = block
                balances[chainId].native.balance = nativeBalance
            }
            assignToWeb3State({ balances })
        }
    }
    async function blockPoll() {
        let { provider } = get(Web3)
        let block = await provider.getBlockNumber()
        let network = await provider.getNetwork()
            .catch(() => { return undefined })
        if (network) {
            assignToWeb3State({ block })
            updateBalances()
        }
        setTimeout(blockPoll, 1000)
    }
    blockPoll()
})()
function getSigner() {
    let { provider } = get(Web3)
    provider.getSigner()
}

export { Web3, getSigner }