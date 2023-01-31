// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../Farmable/vars/liquidity.sol';
import '../mods/isOwner.sol';

contract hasExtSetLiquidity is
hasVarLiquidity,
hasModIsOwner
{
    function setLiquidity(address _liquidity) external isOwner
    {
        liquidity = ERC20(_liquidity);
    }
}