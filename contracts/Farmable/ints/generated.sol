// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Generator.sol';
import '../structs/Farm.sol';

function generated(
    Generator storage self
) view returns (uint) {
    uint M = self.M;
    uint C = self.C;
    uint R = self.R;
    uint Tp = self.Tp;
    uint Tc = self.Tc;
    uint t = block.timestamp;
    uint g = M-(C+Tc-Tp)*(M-R)/(t+C-Tp);
    return g * self.S;
}

function generated(
    Generator storage self,
    Farm storage farm
) view returns (uint) {
    return farm.N * generated(self) / self.D;
}