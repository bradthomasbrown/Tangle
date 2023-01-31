// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../vars/minBal.sol';
import '../mods/isOwner.sol';

contract hasExtSetMinBal is
hasVarMinBal,
hasModIsOwner
{
    function setMinBal(uint _minBal) external isOwner
    {
        minBal = _minBal;
    }
}