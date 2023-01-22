// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/sum.sol';

contract hasModFollowsFirstLaw {

    modifier followsFirstLaw(
        Input[] calldata inputs,
        Output[] calldata outputs,
        Rollover[] calldata rollovers
    ) {
        require(sum(inputs) == sum(outputs) + sum(rollovers, inputs), 'first law broken');
        _;
    }

}