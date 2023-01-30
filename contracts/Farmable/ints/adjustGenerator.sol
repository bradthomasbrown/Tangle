// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import './generated.sol';

function adjustGenerator(
    Generator storage generator,
    uint amount
) {
    generator.R = generated(generator) / generator.S;
    generator.T = [generator.T[1], block.timestamp];
    generator.C += generator.T[1] - generator.T[0];
    generator.M += amount;
}

