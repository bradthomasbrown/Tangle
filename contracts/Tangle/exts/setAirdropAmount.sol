// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../vars/airdropAmount.sol';
import '../mods/isOwner.sol';
import '../events/SetAirdropAmount.sol';

contract hasExtSetAirdropAmount is
hasVarAirdropAmount,
hasModIsOwner,
hasEventSetAirdropAmount
{
    function setAirdropAmount(uint _airdropAmount) external isOwner
    {
        airdropAmount = _airdropAmount;
        emit SetAirdropAmount(_airdropAmount);
    }
}