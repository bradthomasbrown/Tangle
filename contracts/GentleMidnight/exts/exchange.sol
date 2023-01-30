// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../events/Exchange.sol';
import '../../ERC20/ints/move.sol';
import '../../ERC20/vars/balanceOf.sol';
import '../../Farmable/ints/adjustGenerator.sol';
import '../../Farmable/vars/generator.sol';
import '../ints/insert.sol';
import '../structs/Input.sol';
import '../vars/ADISA.sol';

contract hasExtExchange is
hasVarADISA,
hasVarBalanceOf,
hasVarGenerator,
hasEventExchange
{
    function exchange(uint work, Request[] calldata requests, uint gas) external payable
    {
        balanceOf[msg.sender] -= gas;
        adjustGenerator(generator, gas);
        Input memory input = Input(work, requests, msg.sender, msg.value, adisa.count++);
        insert(adisa, input);
        emit Exchange(input);
    }
}