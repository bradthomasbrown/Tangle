// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../structs/Rollover.sol';
import '../structs/Input.sol';
import '../ints/insert.sol';

function processRollovers(
    Rollover[] calldata rollovers,
    Input[] calldata inputs,
    ADISA storage adisa
) {
    for (uint i; i < rollovers.length; i++) {
        Rollover calldata rollover = rollovers[i];
        Modifier calldata inMod = rollover.inMod;
        Input calldata input = inputs[inMod.index];
        Modifier[] calldata reqMods = rollover.reqMods;
        Request[] memory requests = new Request[](reqMods.length);
        for (uint j; j < reqMods.length; j++) {
            Modifier calldata reqMod = reqMods[j];
            Request calldata request = input.requests[reqMod.index];
            requests[j] = Request(request.chain, request.value - reqMod.subtrahend);
        }
        insert(adisa, Input(input.work, requests, input.sender, input.value - inMod.subtrahend, input.gas, adisa.count++));
    }
}