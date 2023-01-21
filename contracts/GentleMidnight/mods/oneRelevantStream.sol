// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Stream.sol';

contract hasModOneRelevantStream
{
    modifier inputsOpen(Stream[] calldata streams)
    {
        uint count;
        for (uint i; i < streams.length; i++) if (streams[i].chain == block.chain) count++;
        require(count == 1, 'more or less than one relevant stream');
    }
}