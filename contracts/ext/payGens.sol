// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../enum/FarmID.sol';
import '../free/generated.sol';
import '../var/farms.sol';
import '../var/genPayment.sol';
contract hasExtPayGens is hasVarGenPayment, hasVarFarms {
    function payGens() public {
        if (genPayment == 0) return;
        for (uint i; i < uint8(type(FarmID).max) + 1; i++) {
            Farm storage farm = farms[FarmID(i)];
            Gen storage gen = farm.gen;
            gen.reward = generated(gen) / gen.valueScaler;
            gen.t2 = gen.t1;
            gen.t1 = block.timestamp;
            gen.timeScaler += gen.t1 - gen.t2;
            gen.maxValue += genPayment / (uint8(type(FarmID).max) + 1); }
        genPayment = 0; }}