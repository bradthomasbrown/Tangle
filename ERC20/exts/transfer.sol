// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../events/Transfer.sol';
import '../ints/move.sol';
import '../vars/balanceOf.sol';

contract hasExtTransfer is
hasEventTransfer,
hasVarBalanceOf
{

    function transfer(address to, uint value) external {
        move(balanceOf, msg.sender, to, value);
        emit Transfer(msg.sender, to, value);
    }

}