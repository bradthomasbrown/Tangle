// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Input.sol';

function markInputs(
    Input[] calldata inputs,
    mapping(uint => uint) storage chunks
) {
    for (uint i; i < inputs.length; i++) chunks[inputs[i].id / 256] |= 1 << inputs[i].id % 256;
}