// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './generated.sol';

function _available(
    Generator storage generator,
    Farm storage farm,
    Account storage account    
) view returns (uint) {
    if (farm.P == 0) return 0;
    uint R = generated(generator);
    uint S = farm.S + farm.N * (R - farm.R) / farm.P / farm.D;
    return account.R + account.P * (S - account.S) / 1e38;
}