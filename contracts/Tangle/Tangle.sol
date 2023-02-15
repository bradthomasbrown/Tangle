// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ERC20/ERC20.sol';
import '../Farmable/Farmable.sol';
import '../Forex/Forex.sol';
import '../Tangle/vars/minBal.sol';
import '../Tangle/vars/airdropAmount.sol';
import '../Tangle/vars/owner.sol';
import '../Tangle/exts/setLiquidity.sol';
import '../Tangle/exts/setMinBal.sol';
import '../Tangle/exts/setAirdropAmount.sol';
import '../Tangle/exts/update.sol';
import '../Tangle/exts/root.sol';
import '../Tangle/events/Deploy.sol';

contract Tangle is
ERC20,
Farmable,
Forex,
hasExtSetLiquidity,
hasExtSetMinBal,
hasExtSetAirdropAmount,
hasExtUpdate,
hasExtRoot,
hasEventDeploy
{

    constructor()
    {
        // ERC20 init
        name = "Tangle";
        symbol = "TNGL";
        decimals = 9;
        totalSupply = 1e9 * 10 ** decimals;
        // Farmable init
        generator.C = 14016000;
        generator.Tp = block.timestamp;
        generator.Tc = block.timestamp;
        generator.D = 100;
        generator.S = 1e32;
        farms['hold'].N = 4;
        farms['airdrop'].N = 10;
        farms['stake'].N = 32;
        farms['GentleMidnight'].N = 52;
        // Tangle init
        owner = msg.sender;
        minBal = 1;
        airdropAmount = 1e9;
        uint initSupply = totalSupply / 10;
        move(address(this), balanceOf, generator, farms, accounts, minBal, [address(0), msg.sender], initSupply);
        move(address(this), balanceOf, generator, farms, accounts, minBal, [address(0), address(this)], totalSupply - initSupply);
        emit Transfer(address(0), address(this), totalSupply - initSupply);
        emit Transfer(address(0), msg.sender, initSupply);
        emit Deploy();
    }

}