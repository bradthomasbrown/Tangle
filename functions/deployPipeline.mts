import { AddressZero } from "@ethersproject/constants";
import { Chain } from "../classes/Chain.mjs";
import { Contract, ContractFactory, Wallet } from "ethers5";
import { parseEther } from "@ethersproject/units";
import { Interface } from "@ethersproject/abi";
import { drink } from "./index.mjs";

export async function deployPipeline(this: Chain) {
    let [ compiled, _ ] = await Promise.all([this.compiled, this.ready])
    let x: { [k: string]: [Interface, string, Wallet] } = Object.fromEntries(Object.entries(compiled).map(e => [e[0], [e[1].abi, e[1].bytecode, this.wallet]]))
    /*let Tangle = */this.contracts['tangle'] = await new ContractFactory(...x['tangle']).deploy({ gasPrice: 0})
    let Weth = this.contracts['weth'] = await new ContractFactory(...x['weth']).deploy({ gasPrice: 0})
    let Factory = this.contracts['factory'] = await new ContractFactory(...x['factory']).deploy(AddressZero, { gasPrice: 0})
    /*let Router = */this.contracts['router'] = await new ContractFactory(...x['router']).deploy(Factory.address, Weth.address, { gasPrice: 0})
    // await drink.bind(this)('1')
    // let token = Tangle.address
    // let amountTokenDesired = await Tangle.balanceOf(this.wallet.address)
    // let to = this.wallet.address
    // let deadline = parseInt(String(Date.now() / 1000)) + 60
    // await (await Tangle.approve(Router.address, amountTokenDesired, { gasPrice: 0 })).wait()
    // if the addLiquidityETH fails, run the below code, might be a init code hash problem
    // console.log(await Factory.initCodeHash())
    // await (await Router.addLiquidityETH(token, amountTokenDesired, 0, 0, to, deadline, { gasPrice: 0, value: parseEther('1'), gasLimit: 5000000 })).wait()
    // let Liquidity = this.contracts['liquidity'] = new Contract(await Factory.getPair(Tangle.address, Weth.address), Tangle.interface, this.wallet)
    // await (await Tangle.setLiquidity(Liquidity.address, { gasPrice: 0 })).wait()
}