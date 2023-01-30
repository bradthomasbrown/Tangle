// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './ruler.sol';
import '../structs/ADISA.sol';
import '../structs/Input.sol';

function insert(
    ADISA storage adisa,
    Input memory input
) {
    uint r = ruler(input.id);
    bytes32 h = keccak256(abi.encode(input));
    for (uint i; i < r; i++) h = keccak256(abi.encode(adisa.roots[i], h));
    adisa.roots[r] = h;
}