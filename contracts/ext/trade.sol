// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../int/insertReq.sol';
import '../int/move.sol';
contract hasExtTrade is hasIntInsertReq, hasIntMove {
    function trade(Subreq[] calldata subreqs) external payable {
        uint gas;
        uint input;
        for (uint i; i < subreqs.length; i++) {
            Subreq calldata subreq = subreqs[i];
            require(subreq.work != 0, 'zero work');
            gas += subreq.gas;
            input += subreq.input;
            insertReq(Req(msg.sender, subreq.gas, subreq.work, 
                block.chainid, subreq.dest, subreq.input, 
                subreq.output, adisa.count++)); }
        require(input == msg.value, 'incorrect msg.value');
        require(balanceOf[msg.sender] - gas >= minBal, 'minBal');
        move(msg.sender, address(this), gas); }}
struct Subreq { uint gas; uint work; uint dest; uint input; uint output; }