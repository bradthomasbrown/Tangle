// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../events/Transfer.sol';
import '../ints/move.sol';
import '../vars/allowance.sol';
import '../vars/balanceOf.sol';

contract hasExtTransferFrom is
hasEventTransfer,
hasVarAllowance,
hasVarBalanceOf
{

    function transferFrom(
        address from, 
        address to, 
        uint value
    ) external {
        allowance[from][to] -= value;
        move(balanceOf, msg.sender, to, value);
        emit Transfer(from, to, value);
    }

}