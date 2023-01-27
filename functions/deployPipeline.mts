import { AddressZero } from "@ethersproject/constants";
import { Chain } from "../classes/Chain.mjs";
import { handleCatch } from "./handle.mjs";

export async function deployPipeline(this: Chain) {
    await this.deploy('tangle').catch(handleCatch)
    await this.deploy('weth').catch(handleCatch)
    await this.deploy('factory', AddressZero).catch(handleCatch)
    await this.deploy('router', this.contracts['factory'].address, this.contracts['weth'].address).catch(handleCatch)
}