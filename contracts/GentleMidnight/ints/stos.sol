// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Stream.sol';

function stos(Stream[] calldata streams) view returns (Stream calldata stream) {
    stream = streams[0];
    for (uint i; i < streams.length; i++) if (streams[i].chain == block.chainid) return streams[i];
}