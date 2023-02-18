// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../free/log2.sol';
import '../struct/Req.sol';
import '../var/ADISA.sol';
contract hasIntInsertReq is hasVarADISA {
    function insertReq(Req memory req) internal {
        uint r = log2(req.id ^ req.id + 1);
        bytes32 h = keccak256(abi.encode(req));
        for (uint i; i < r; i++) h = keccak256(abi.encode(adisa.roots[i], h));
        adisa.roots[r] = h;
        emit NewReq(req); }
    event NewReq(Req req); }