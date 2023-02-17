// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../free/generated.sol';
import '../struct/Acc.sol';
import '../var/accs.sol';
import '../var/farms.sol';
contract hasIntGetAvail is hasVarAccs, hasVarFarms {
    function getAvail(address guy, uint id) internal view
    returns (uint) {
        Farm storage farm = farms[FarmID(id)];
        Gen storage gen = farm.gen;
        Acc storage acc = accs[FarmID(id)][guy];
        if (farm.points == 0) return 0;
        uint sigma = farm.sigma + (generated(gen) - farm.reward) / farm.points;
        return acc.reward + acc.points * (sigma - acc.sigma) / gen.valueScaler; }}