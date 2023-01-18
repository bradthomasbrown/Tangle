// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './log2.sol';

function ruler(uint x) pure returns (uint) {
    return log2(x ^ x + 1);
}