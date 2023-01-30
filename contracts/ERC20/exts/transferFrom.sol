// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../events/Transfer.sol';
import '../ints/move.sol';
import '../vars/allowance.sol';
import '../vars/balanceOf.sol';
import '../../Farmable/vars/generator.sol';
import '../../Farmable/vars/liquidity.sol';
import '../../Tangle/vars/minBal.sol';

contract hasExtTransferFrom is
hasEventTransfer,
hasVarAllowance,
hasVarBalanceOf,
hasVarGenerator,
hasVarLiquidity,
hasVarMinBal
{

    function transferFrom(
        address from, 
        address to, 
        uint value
    ) external {
        allowance[from][msg.sender] -= value;
        move(address(this), address(liquidity), balanceOf, generator, minBal, [from, to], value);
        emit Transfer(from, to, value);
    }

}