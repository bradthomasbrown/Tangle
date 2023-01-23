// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './Input.sol';
import './Output.sol';
import './Rollover.sol';

struct Stream {
    Input[] inputs;
    Output[] outputs;
    Rollover[] rollovers;
    uint chain;
}