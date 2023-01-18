// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './Farm.sol';

struct Generator {
    mapping(string => Farm) farms;
    uint M;
    uint C;
    uint R;
    uint I;
    uint T;
}