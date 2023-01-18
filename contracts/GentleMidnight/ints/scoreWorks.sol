// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './score.sol';
import '../structs/Work.sol';

function scoreWorks(Work[] calldata works) pure returns (uint sum) {
    for (uint i; i < workchain.length; i++)
        sum += score(keccak256(abi.encode(workchain[i])));
}