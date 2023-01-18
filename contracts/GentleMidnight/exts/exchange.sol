// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/insert.sol';
import '../mods/reqChainsOrderedNoDuplicates.sol';
import '../vars/ZippySoup.sol';

contract hasExtExchange is
hasModReqChainsOrderedNoDuplicates,
hasVarZippySoup
{

    function exchange(AER_0 calldata a0) external payable
    reqChainsOrderedNoDuplicates(a0)
    { insert(zs, a0, msg.sender, msg.value); }

}