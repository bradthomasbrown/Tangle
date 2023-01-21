// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './Request.sol';

struct Input {
    uint work;
    Request[] requests;
    address sender;
    uint value;
    uint id; 
}