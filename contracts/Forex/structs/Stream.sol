// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './Request.sol';
import './Output.sol';
import './Proof.sol';

struct Stream {
    Request[] requests;
    Proof[] proofs;
    Output[] outputs;
    uint chain;
}