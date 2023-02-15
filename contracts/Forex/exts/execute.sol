// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../Farmable/ints/adjustPoints.sol';
import '../../Farmable/vars/accounts.sol';
import '../../Farmable/vars/farms.sol';
import '../../Farmable/vars/generator.sol';

import '../ints/stos.sol';
import '../mods/requestsOpen.sol';
import '../vars/chunks.sol';
import '../mods/requestsVerified.sol';
import '../vars/ADISA.sol';
import '../mods/workchainIntact.sol';
import '../mods/workSufficient.sol';
import '../mods/followsFirstLaw.sol';
import '../mods/requestsDistinct.sol';
import '../ints/processOutputs.sol';
import '../ints/markRequests.sol';
import '../ints/gas.sol';
import '../ints/work.sol';
import '../ints/score.sol';
import '../events/NewRequest.sol';
import '../events/Mark.sol';
import '../events/Execute.sol';

contract hasExtExecute is
hasEventNewRequest,
hasEventMark,
hasEventExecute,
hasModRequestsOpen,
hasModRequestsDistinct,
hasModRequestsVerified,
hasModWorkchainIntact,
hasModWorkSufficient,
hasModFollowsFirstLaw,
hasVarAccounts,
hasVarFarms,
hasVarGenerator,
hasVarADISA,
hasVarChunks
{
    function execute(
        Stream[] calldata streams, 
        Work[] calldata works, 
        Proof[] calldata proofs
    ) external
    requestsOpen(stos(streams).requests, chunks)
    requestsDistinct(stos(streams).requests)
    requestsVerified(stos(streams).requests, stos(streams).proofs, adisa)
    workchainIntact(works, streams, proofs)
    workSufficient(works, stos(streams).requests)
    followsFirstLaw(stos(streams).requests, stos(streams).outputs)
    {
        Stream calldata stream = stos(streams);
        Request[] calldata requests = stream.requests;
        Output[] calldata outputs = stream.outputs;
        markRequests(requests, chunks);
        for (uint i; i < requests.length; i++) emit Mark(requests[i].id);
        processOutputs(outputs);
        Farm storage farm = farms['GentleMidnight'];
        for (uint i; i < works.length; i++) {
            address worker = works[i].worker;
            Account storage account = accounts['GentleMidnight'][worker];
            int s = int(
                score(works, worker) * 
                gas(requests) *
                work(requests)
            );
            adjustPoints(generator, farm, account, s);
        }
        emit Execute(msg.sender, streams, works, proofs);
    }
}