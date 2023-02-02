// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../Farmable/vars/liquidity.sol';
import '../mods/isOwner.sol';
import '../events/SetLiquidity.sol';

contract hasExtSetLiquidity is
hasVarLiquidity,
hasModIsOwner,
hasEventSetLiquidity
{
    function setLiquidity(address _liquidity) external isOwner
    {
        liquidity = ERC20(_liquidity);
        emit SetLiquidity(_liquidity);
    }
}