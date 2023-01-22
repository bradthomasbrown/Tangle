// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../Farmable/ints/adjustPoints.sol';
import '../../Farmable/vars/generator.sol';

import '../ints/stos.sol';
import '../mods/inputsOpen.sol';
import '../vars/chunks.sol';
import '../mods/inputsVerified.sol';
import '../vars/ZippySoup.sol';
import '../mods/workchainIntact.sol';
import '../mods/workSufficient.sol';
import '../mods/followsFirstLaw.sol';
import '../ints/processRollovers.sol';
import '../ints/processOutputs.sol';
import '../ints/markInputs.sol';
import '../ints/getExecutor.sol';

contract hasExtExecute is
hasVarChunks,
hasModInputsOpen,
hasVarZippySoup,
hasModInputsVerified,
hasModWorkchainIntact,
hasModWorkSufficient,
hasModFollowsFirstLaw,
hasVarGenerator
{
    function execute(
        Stream[] calldata streams, 
        Work[] calldata works, 
        Proof[] calldata workProofs, 
        Proof[] calldata inputProofs
    ) external
    inputsOpen(stos(streams).inputs, chunks)
    inputsVerified(stos(streams).inputs, inputProofs, zs)
    workchainIntact(works, streams, workProofs)
    workSufficient(works, stos(streams).inputs)
    followsFirstLaw(stos(streams).inputs, stos(streams).outputs, stos(streams).rollovers)
    {
        Stream calldata stream = stos(streams);
        processRollovers(stream.rollovers, stream.inputs, zs);
        processOutputs(stream.outputs);
        markInputs(stream.inputs, chunks);
        Farm storage farm = generator.farms['GentleMidnight'];
        Input[] calldata inputs = stream.inputs;
        for (uint i; i < works.length; i++) {
            address worker = works[i].worker;
            adjustPoints(generator, farm, farm.accounts[worker], int(score(works, worker) * 1 / 4));
            payable(worker).transfer(sum(inputs) * 1 * 1 * score(works, worker) / score(works) / 20 / 4);
        }
        address executor = getExecutor(works, max(inputs));
        adjustPoints(generator, farm, farm.accounts[executor], int(score(works) * 3 / 4));
        payable(executor).transfer(sum(inputs) * 3 * 1 / 20 / 4);
    }
}