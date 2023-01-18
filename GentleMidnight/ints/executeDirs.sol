// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Dir.sol';

function executeDirs(Dir[] calldata dirs) {
    for (uint i; i < dirs.length; i++)
        payable(dirs[i].recipient).transfer(dirs[i].value * 19 / 20);
}