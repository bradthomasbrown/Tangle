// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/ints/move.sol';
import '../../ERC20/vars/balanceOf.sol';
import '../../Farmable/ints/adjustGenerator.sol';
import '../../Farmable/vars/generator.sol';
import '../ints/insert.sol';
import '../structs/Input.sol';
import '../vars/ZippySoup.sol';

contract hasExtExchange is
hasVarZippySoup,
hasVarBalanceOf,
hasVarGenerator
{
    function exchange(uint work, Request[] calldata requests, uint gas) external payable
    {
        balanceOf[msg.sender] -= gas;
        adjustGenerator(generator, gas);
        insert(zs, Input(work, requests, msg.sender, msg.value, zs.count++));
    }
}