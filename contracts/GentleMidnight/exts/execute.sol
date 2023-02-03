// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../Farmable/ints/adjustPoints.sol';
import '../../Farmable/vars/accounts.sol';
import '../../Farmable/vars/farms.sol';
import '../../Farmable/vars/generator.sol';

import '../ints/stos.sol';
import '../mods/inputsOpen.sol';
import '../vars/chunks.sol';
import '../mods/inputsVerified.sol';
import '../vars/ADISA.sol';
import '../mods/workchainIntact.sol';
import '../mods/workSufficient.sol';
import '../mods/followsFirstLaw.sol';
import '../mods/inputsDistinct.sol';
import '../ints/processRollovers.sol';
import '../ints/processOutputs.sol';
import '../ints/markInputs.sol';
import '../ints/getExecutor.sol';
import '../ints/gas.sol';
import '../ints/work.sol';
import '../events/Execute.sol';

contract hasExtExecute is
hasModInputsOpen,
hasModInputsDistinct,
hasModInputsVerified,
hasModWorkchainIntact,
hasModWorkSufficient,
hasModFollowsFirstLaw,
hasVarAccounts,
hasVarFarms,
hasVarGenerator,
hasVarADISA,
hasVarChunks,
hasEventExecute
{
    function execute(
        Stream[] calldata streams, 
        Work[] calldata works, 
        Proof[] calldata proofs
    ) external
    inputsOpen(stos(streams).inputs, chunks)
    inputsDistinct(stos(streams).inputs)
    inputsVerified(stos(streams).inputs, stos(streams).proofs, adisa)
    workchainIntact(works, streams, proofs)
    workSufficient(works, stos(streams).inputs)
    followsFirstLaw(stos(streams).inputs, stos(streams).outputs, stos(streams).rollovers)
    {
        Stream calldata stream = stos(streams);
        Input[] calldata inputs = stream.inputs;
        processRollovers(stream.rollovers, inputs, adisa);
        processOutputs(stream.outputs);
        markInputs(inputs, chunks);
        Farm storage farm = farms['GentleMidnight'];
        for (uint i; i < works.length; i++) {
            address worker = works[i].worker;
            adjustPoints(generator, farm, accounts['GentleMidnight'][worker], int(score(works, worker) * gas(inputs) / work(inputs)));
            payable(worker).transfer(sum(inputs) * 1 * 1 * score(works, worker) / score(works) / 20 / 4);
        }
        address executor = getExecutor(works, max(inputs));
        adjustPoints(generator, farm, accounts['GentleMidnight'][executor], int(score(works) * 3 * gas(inputs) / work(inputs)));
        payable(executor).transfer(sum(inputs) * 3 * 1 / 20 / 4);
        emit Execute(msg.sender, streams, works, proofs);
    }
}