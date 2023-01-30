// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../events/Transfer.sol';
import '../ints/move.sol';
import '../vars/balanceOf.sol';
import '../../Farmable/vars/generator.sol';
import '../../Farmable/vars/liquidity.sol';
import '../../Tangle/vars/minBal.sol';

contract hasExtTransfer is
hasEventTransfer,
hasVarBalanceOf,
hasVarGenerator,
hasVarLiquidity,
hasVarMinBal
{

    function transfer(address to, uint value) external {
        move(address(this), address(liquidity), balanceOf, generator, minBal, [msg.sender, to], value);
        emit Transfer(msg.sender, to, value);
    }

}