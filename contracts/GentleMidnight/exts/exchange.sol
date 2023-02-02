// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../events/Exchange.sol';
import '../../ERC20/ints/move.sol';
import '../../ERC20/vars/balanceOf.sol';
import '../../Farmable/ints/adjustGenerator.sol';
import '../../Farmable/vars/accounts.sol';
import '../../Farmable/vars/farms.sol';
import '../../Farmable/vars/generator.sol';
import '../../Tangle/vars/minBal.sol';
import '../ints/insert.sol';
import '../structs/Input.sol';
import '../vars/ADISA.sol';
import '../mods/nonzeroWork.sol';

contract hasExtExchange is
hasEventExchange,
hasVarBalanceOf,
hasVarAccounts,
hasVarFarms,
hasVarGenerator,
hasVarADISA,
hasVarMinBal,
hasModNonzeroWork
{
    function exchange(uint work, Request[] calldata requests, uint gas) external payable nonzeroWork(work)
    {
        move(address(this), balanceOf, generator, farms, accounts, minBal, [msg.sender, address(this)], gas);
        Input memory input = Input(work, requests, msg.sender, msg.value, gas, adisa.count++);
        insert(adisa, input);
        emit Exchange(input);
    }
}