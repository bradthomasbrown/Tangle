import { Interface } from "@ethersproject/abi";

export interface Compiled {
    [key: string]: {
        abi: Interface,
        bytecode: string
    }
}