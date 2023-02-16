// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
function verify(bytes32 n, Proof calldata proof, bytes32 root) pure 
returns (bool) {
    bytes32[] calldata hashes = proof.hashes;
    uint i = proof.index;
    while (hashes.length > 0) {
        bytes32 m = hashes[0];
        if (i % 2 == 1) (n, m) = (m, n);
        n = keccak256(abi.encode(n, m));
        i /= 2;
        hashes = hashes[1:]; }
    return n == root; }
struct Proof { bytes32[] hashes; uint index; uint subtree; }