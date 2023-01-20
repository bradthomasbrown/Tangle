// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Generator.sol';

function generated(
    Generator storage self
) view returns (uint) {
    return (self.M - self.C * (self.M - self.R) / (block.timestamp - self.I + self.C - self.T)) * 1e38;
}