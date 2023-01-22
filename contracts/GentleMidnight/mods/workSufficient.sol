// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ints/score.sol';
import '../ints/max.sol';

contract hasModWorkSufficient {

    modifier workSufficient (
        Work[] calldata works,
        Input[] calldata inputs
    ) {
        require(score(works) >= max(inputs), 'work insufficient');
        _;
    }

}