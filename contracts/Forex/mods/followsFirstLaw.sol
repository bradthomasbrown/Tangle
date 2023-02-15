// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/sum.sol';

contract hasModFollowsFirstLaw {

    modifier followsFirstLaw(
        Request[] calldata requests,
        Output[] calldata outputs
    ) {
        require(sum(requests) == sum(outputs), 'first law broken');
        _;
    }

}