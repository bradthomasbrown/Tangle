// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './Proof.sol';

struct Work {
    Proof proof;
    bytes32 root;
    address worker;
    uint n;
}