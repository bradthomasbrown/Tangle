// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './log2.sol';
import '../structs/Work.sol';

function score(bytes32 h) pure returns (uint) {
    return 1 << 255 - log2(uint(h));
}

function score(Work[] memory works) pure returns (uint sum) {
    for (uint i; i < works.length; i++)
        sum += score(keccak256(abi.encode(works[i])));
}

function score(Work[] memory works, address worker) pure returns (uint sum) {
    for (uint i; i < works.length; i++)
        if (works[i].worker == worker)
            sum += score(keccak256(abi.encode(works[i])));
}