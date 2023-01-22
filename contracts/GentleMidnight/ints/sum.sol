// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Input.sol';
import '../structs/Output.sol';
import '../structs/Rollover.sol';

function sum(Input[] memory inputs) pure returns (uint x) {
    for (uint i; i < inputs.length; i++) x += inputs[i].value;
}

function sum(Output[] memory outputs) pure returns (uint x) {
    for (uint i; i < outputs.length; i++) x += outputs[i].value;
}

function sum(
    Rollover[] memory rollovers,
    Input[] memory inputs
) pure returns (uint x) {
    for (uint i; i < rollovers.length; i++) x += inputs[rollovers[i].inMod.index].value - rollovers[i].inMod.subtrahend;
}