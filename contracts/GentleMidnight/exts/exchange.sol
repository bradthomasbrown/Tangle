// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/ints/move.sol';
import '../../ERC20/vars/balanceOf.sol';
import '../../Farmable/ints/adjustGenerator.sol';
import '../../Farmable/vars/generators.sol';
import '../ints/insert.sol';
import '../mods/requestChainsDistinct.sol';
import '../structs/Input.sol';
import '../vars/ZippySoup.sol';

contract hasExtExchange is
hasVarBalanceOf,
hasVarGenerators,
hasModRequestChainsDistinct,
hasVarZippySoup
{
    function exchange(uint work, Request[] requests, uint gas) external payable
    requestChainsDistinct(requests)
    {
        move(balanceOf, msg.sender, address(this), gas);
        adjustGenerator(generators['tangle'], gas);
        insert(zs, Input(work, requests, msg.sender, msg.value, zs.count++));
    }
}