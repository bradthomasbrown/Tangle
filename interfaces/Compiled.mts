import { Interface } from 'ethers/lib/utils.js'

export interface Compiled {
    [key: string]: {
        abi: Interface,
        bytecode: string
    }
}