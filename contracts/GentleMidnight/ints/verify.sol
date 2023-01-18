// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Proof.sol';

function verify(
    bytes32 n,
    Proof calldata proof,
    bytes32 root
) pure returns (bool) {
    bytes32[] calldata hashes = proof.hashes;
    for ((uint i, bytes32 m) = (proof.leaf, hashes[0]); i > 0; (i /= 2, hashes = hashes[1:], m = hashes[0])) {
        if (--i % 2 == 1) (n, m) = (m, n);
        n = keccak256(abi.encode(n, m));
    }
    return n == root;
}