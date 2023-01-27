import { AddressZero } from "@ethersproject/constants";
import { Chain } from "../classes/Chain.mjs";
import { handleCatch } from "./handle.mjs";

export async function deployPipeline(this: Chain) {
    await this.deploy('tangle').catch(handleCatch)
    await this.deploy('weth').catch(handleCatch)
    await this.deploy('factory', AddressZero).catch(handleCatch)
    let { factory, weth } = this.contracts
    await this.deploy('router', factory.address, weth.address).catch(handleCatch)
    let { router, tangle } = this.contracts

    // TODO: GETFUNDS()
    // either clever pipe trick or geth remote sendTransactions

    // router.addLiquidityETH(...args)
    // let liquidity = await factory.getPair(tangle.address, weth.address)
    // await tangle.setLiquidity(liquidity)

}