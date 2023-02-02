// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Input.sol';

function work(Input[] memory inputs) pure returns (uint x) {
    for (uint i; i < inputs.length; i++) x += inputs[i].work;
}