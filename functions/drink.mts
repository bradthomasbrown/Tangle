import { readFileSync, writeFileSync } from 'fs';
import { parseEther } from "ethers/lib/utils.js";
import { Chain } from '../classes/Chain.mjs';

export async function drink(this: Chain, a: string, n: string) {
    writeFileSync(`pipes/chain${this.chainid}`, `${a} ${parseEther(n)}`)
    await this.provider.waitForTransaction(readFileSync(`pipes/chain${this.chainid}`).toString())
}