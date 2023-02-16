// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../struct/Gen.sol';
function generated(Gen storage gen) view returns (uint) {
    return gen.valueScaler 
            *  (gen.maxValue 
                -  (gen.timeScaler + gen.t1 - gen.t2)
                    * (gen.maxValue - gen.reward)
                    / (block.timestamp + gen.timeScaler - gen.t2)); }