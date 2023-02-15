// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Output.sol';

function processOutputs(Output[] calldata outputs) {
    for (uint i; i < outputs.length; i++) payable(outputs[i].recipient).transfer(outputs[i].value * 19 / 20);
}