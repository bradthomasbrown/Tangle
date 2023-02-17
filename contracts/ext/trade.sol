// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../free/log2.sol';
import '../int/move.sol';
import '../struct/Request.sol';
import '../var/ADISA.sol';
contract hasExtTrade is hasVarADISA, hasIntMove {
    function trade(uint gas, uint work, uint dest, uint output)
    external payable {
        require(work != 0, 'zero work');
        if (balanceOf[msg.sender] - gas < minBal) gas -= minBal;
        move(msg.sender, address(this), gas);
        Request memory request = Request(msg.sender, gas,  work, block.chainid,
            dest, msg.value, output, adisa.count++);
        uint r = log2(request.id ^ request.id + 1);
        bytes32 h = keccak256(abi.encode(request));
        for (uint i; i < r; i++) h = keccak256(abi.encode(adisa.roots[i], h));
        adisa.roots[r] = h;
        emit NewRequest(request); }
    event NewRequest(Request request); }