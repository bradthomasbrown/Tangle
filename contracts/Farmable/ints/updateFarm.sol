// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './generated.sol';

function updateFarm(
    Generator storage generator,
    Farm storage farm    
) {
    if (farm.P == 0) return;
    uint R = generated(generator);
    farm.S += farm.N * (R - farm.R) / farm.P / farm.D;
    farm.R = R;
}