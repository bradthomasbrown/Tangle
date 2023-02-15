// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Farm.sol';
import './generated.sol';

function updateFarm(
    Generator storage generator,
    Farm storage farm    
) {
    if (farm.P == 0) return;
    farm.S += (generated(generator, farm) - farm.R) / farm.P;
    farm.R = generated(generator, farm);
}