// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Input.sol';

contract hasModNonzeroWork
{
    modifier nonzeroWork(uint work) {
        require(work > 0, 'nonzero work');
        _;
    }
}