// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause d
pragma solidity ^0.8.17;

import '../ERC20/ERC20.sol';
import '../Farmable/Farmable.sol';
import '../GentleMidnight/GentleMidnight.sol';
import '../Tangle/vars/minBal.sol';
import '../Tangle/vars/airdropAmount.sol';
import '../Tangle/vars/owner.sol';
import '../Tangle/exts/setLiquidity.sol';
import '../Tangle/exts/setMinBal.sol';
import '../Tangle/exts/setAirdropAmount.sol';
import '../Tangle/exts/update.sol';
import '../Tangle/exts/root.sol';

contract Tangle is
ERC20,
Farmable,
GentleMidnight,
hasExtSetLiquidity,
hasExtSetMinBal,
hasExtSetAirdropAmount,
hasExtUpdate,
hasExtRoot
{

    constructor()
    {
        // ERC20 init
        name = "Tangle";
        symbol = "TNGL";
        decimals = 9;
        totalSupply = 1e9 * 10 ** decimals;
        uint initSupply = totalSupply / 10;
        move(address(this), address(liquidity), balanceOf, generator, minBal, [address(0), msg.sender], initSupply);
        move(address(this), address(liquidity), balanceOf, generator, minBal, [address(0), address(this)], totalSupply - initSupply);
        // Farmable init
        generator.M = totalSupply - initSupply;
        generator.C = 14016000;
        generator.T = [block.timestamp, block.timestamp];
        generator.farms['hold'].N = 16;
        generator.farms['airdrop'].N = 16;
        generator.farms['stake'].N = 16;
        generator.farms['GentleMidnight'].N = 52;
        generator.D = 100;
        generator.S = 1e32;
        // Tangle init
        owner = msg.sender;
        minBal = 1;
        airdropAmount = 1e9;
    }

}