// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/AER_2.sol';

function markInputs(
    AER_2[] calldata a2s,
    mapping(uint => uint) storage chunks
) {
    for (uint i; i < a2s.length; i++)
        chunks[a2s[i]._1.id / 256] &= 1 << a2s[i]._1.id % 256;
}