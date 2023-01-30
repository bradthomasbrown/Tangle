// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../vars/owner.sol';

contract hasModIsOwner is
hasVarOwner
{

    modifier isOwner() {
        require(msg.sender == owner, 'not owner');
        _;
    }

}