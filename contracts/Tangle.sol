// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '@ERC20/ERC20.sol';
import '@Farmable/Farmable.sol';
import '@GentleMidnight/GentleMidnight.sol';

contract Tangle is
ERC20,
Farmable,
GentleMidnight
{
    
    address public owner;

    constructor() {

        // ERC20 init
        name = "Tangle";
        symbol = "TNGL";
        decimals = 9;
        uint finalSupply = 1e9 * 10 ** decimals;
        uint initSupply = finalSupply / 10;
        totalSupply = initSupply;
        balanceOf[msg.sender] += initSupply;

        // Farmable init
        generators['tangle'].M = finalSupply - initSupply;
        generators['tangle'].C = 14016000;
        generators['tangle'].I = block.timestamp;
        generators['tangle'].farms['airdrop'].N = 1;
        generators['tangle'].farms['airdrop'].D = 1;

        // Tangle init
        owner = msg.sender;

    }

    function setLiquidity(address _liquidity) external {
        require(msg.sender == owner);
        liquidity = ERC20(_liquidity);
    }

}