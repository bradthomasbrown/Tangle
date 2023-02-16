// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import './ext/adjustStake.sol';
import './ext/airdrop.sol';
import './ext/approve.sol';
import './ext/available.sol';
import './ext/claim.sol';
import './ext/execute.sol';
import './ext/trade.sol';
import './ext/transfer.sol';
import './ext/transferFrom.sol';
import './int/move.sol';
contract Tangle is
hasExtAdjustStake, hasExtAirdrop, hasExtApprove, hasExtAvailable, hasExtClaim, 
hasExtExecute, hasExtTrade, hasExtTransfer, hasExtTransferFrom {
    constructor() {
        string[4] memory ids = ['hold', 'airdrop', 'stake', 'mine'];
        for (uint i; i < ids.length; i++) {
            Farm storage farm = farms[ids[i]];
            Gen storage gen = farm.gen;
            gen.t2 = block.timestamp;
            gen.t1 = block.timestamp;
            gen.timeScaler = 14016000;
            gen.valueScaler = 1e32; }
        owner = msg.sender;
        minBal = 1;
        airdropAmount = 1e9;
        uint initSupply = totalSupply / 10;
        move(address(0), msg.sender, initSupply);
        move(address(0), address(this), totalSupply - initSupply); }
    string public name = "Tangle";
    string public symbol = "TNGL";
    uint public decimals = 9;
    uint public totalSupply = 1e9 * 10 ** decimals;
    address public owner; }

