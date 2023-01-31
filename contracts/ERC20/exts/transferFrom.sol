// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../events/Transfer.sol';
import '../ints/move.sol';
import '../vars/allowance.sol';
import '../vars/balanceOf.sol';
import '../../Farmable/vars/accounts.sol';
import '../../Farmable/vars/farms.sol';
import '../../Farmable/vars/generator.sol';
import '../../Farmable/vars/liquidity.sol';
import '../../Tangle/vars/minBal.sol';
import '../../Tangle/vars/owner.sol';

contract hasExtTransferFrom is
hasEventTransfer,
hasVarAllowance,
hasVarBalanceOf,
hasVarAccounts,
hasVarFarms,
hasVarGenerator,
hasVarLiquidity,
hasVarMinBal,
hasVarOwner
{

    function transferFrom(
        address from, 
        address to, 
        uint value
    ) external {
        allowance[from][msg.sender] -= value;
        move(address(this), balanceOf, generator, farms, accounts, minBal, [from, to], value);
        emit Transfer(from, to, value);
    }

}