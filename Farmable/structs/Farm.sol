// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './Account.sol';

struct Farm {
    uint S;
    uint P;
    uint N;
    uint D;
    uint R;
    mapping(address => Account) accounts;
}