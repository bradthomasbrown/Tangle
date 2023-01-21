// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Input.sol';
import '../structs/Proof.sol';
import '../structs/ZippySoup.sol';

function verifyInput(
    Input calldata input,
    InputProof calldata proof,
    ZippySoup storage zs
) pure returns (bool) {
   return verify(keccak256(abi.encode(input), Proof(proof.hashes, proof.leafIndex), zs.roots[proof.ZSIndex]));
}