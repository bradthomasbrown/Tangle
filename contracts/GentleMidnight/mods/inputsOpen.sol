// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Stream.sol';

contract hasModInputsOpen
{
    modifier inputsOpen(
        Stream[] calldata streams,
        mapping(uint => uint) storage chunks,
    ) {
        uint i;
        for (; streams[i].chain != block.chainid; i++);
        Stream calldata stream = streams[i];
        for (i = 0; i < stream.inputs.length; i++) {
            uint id = stream.inputs[i].id;
            require(chunks[id / 256] & 1 << id % 256 == 0, 'input closed')
        }
        _;
    }
}