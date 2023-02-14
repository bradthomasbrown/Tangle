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
import '../ints/score.sol';
import '../events/Exchange.sol';
import '../events/Mark.sol';
import '../events/Execute.sol';

contract hasExtExecute is
hasEventExchange,
hasEventMark,
hasEventExecute,
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
hasVarChunks
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
        Output[] calldata outputs = stream.outputs;
        for (uint i; i < inputs.length; i++) emit Mark(inputs[i]);
        markInputs(inputs, chunks);
        Input[] memory newInputs = processRollovers(stream.rollovers, inputs, adisa);
        for (uint i; i < newInputs.length; i++) emit Exchange(newInputs[i]);
        processOutputs(outputs);
        Farm storage farm = farms['GentleMidnight'];
        for (uint i; i < works.length; i++) {
            address worker = works[i].worker;
            Account storage account = accounts['GentleMidnight'][worker];
            int s = int(
                score(works, worker) * 
                gas(inputs) * 
                sum(outputs) / 
                work(inputs) /
                sum(inputs) +
                inputs.length
            );
            adjustPoints(generator, farm, account, s);
        }
        emit Execute(msg.sender, streams, works, proofs);
    }
}