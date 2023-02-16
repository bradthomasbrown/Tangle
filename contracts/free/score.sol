// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import './log2.sol';
function score(bytes32 h) pure returns (uint) { return 1 << 255-log2(uint(h)); }