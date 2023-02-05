// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Work.sol';
import '../ints/score.sol';

function getExecutor(
    Work[] calldata works,
    uint max
) pure returns (uint, address) {
    uint sum;
    for (uint i; i < works.length; i++) {
        sum += score(keccak256(abi.encode(works[i])));
        if (sum >= max) return (i + 1, works[i].worker);
    }
    return (0, address(0));
}