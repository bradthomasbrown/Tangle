// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Generator.sol';

function generated(
    Generator storage self
) view returns (uint) {
    uint M = self.M;
    uint C = self.C;
    uint R = self.R;
    uint t = block.timestamp;
    uint Tp = self.T[0];
    uint Tc = self.T[1];
    uint g = M-(C+Tc-Tp)*(M-R)/(t+C-Tp);
    return g * self.S;
}