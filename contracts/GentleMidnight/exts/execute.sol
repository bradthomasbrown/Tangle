// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../../ERC20/ints/move.sol';
import '../../ERC20/vars/balanceOf.sol';

import '../../Farmable/ints/adjustPoints.sol';
import '../../Farmable/ints/adjustGenerator.sol';
import '../../Farmable/vars/generators.sol';

import '../ints/applyRefunds.sol';
import '../ints/createNewInputs.sol';
import '../ints/executeDirs.sol';
import '../ints/markInputs.sol';
import '../mods/inputsOpen.sol';
import '../mods/inputsVerified.sol';
import '../mods/auditWorks.sol';
import '../mods/outputsNotGreaterThanInputs.sol';
import '../mods/oneRelevantStream.sol';
import '../structs/IO.sol';
import '../structs/Work.sol';
import '../structs/Proof.sol';
import '../structs/InputProof.sol';
import '../vars/chunks.sol';
import '../vars/ZippySoup.sol';

contract hasExtExecute is
hasModInputsOpen,
hasModInputsVerified,
hasModAuditWorks,
hasModOneRelevantStream,
hasModOutputsNotGreaterThanInputs,
hasVarBalanceOf,
hasVarChunks,
hasVarGenerators,
hasVarZippySoup
{
    function execute(
        Stream[] calldata streams, 
        Work[] calldata works, 
        Proof[] workProofs, 
        InputProof[] inputProofs
    ) external
    inputsOpen(streams, chunks)
    inputsVerified(streams, inputProofs, zs)
    oneRelevantStream(streams)
    // TODO: break auditWorks into workchainIntact and worksSufficient
    auditWorks(transaction.works)
    outputsNotGreaterThanInputs(transaction.a2s, transaction.dirs)
    {
        applyRefunds(transaction.a2s);
        createNewInputs(transaction.a2s, zs);
        executeDirs(transaction.dirs);
        markInputs(transaction.a2s, chunks);
        Work[] calldata works = transaction.works;
        string[2] memory foo = ['tangle', 'native'];
        bool yoink = works[works.length - 1].worker == msg.sender;
        for (uint i; i < works.length; i++) {
            int workScore = int(score(keccak256(abi.encode(works[i]))));
            int yoinkedScore;
            if (yoink) {
                yoinkedScore += workScore * 3 / 4;
                workScore = workScore * 1 / 4;
            }
            for (uint j; j < foo.length; j++) {
                Generator storage generator = generators[foo[j]];
                Farm storage farm = generator.farms['GentleMidnight'];
                Account storage account = farm.accounts[works[i].worker];
                adjustPoints(generator, farm, account, workScore);
                if (yoink && i == works.length - 1)
                    adjustPoints(generator, farm, account, yoinkedScore);
            }
        }
        AER_2[] calldata a2s = transaction.a2s;
        uint tax;
        for (uint i; i < a2s.length; i++) {
            tax += a2s[i].refund / 20;
        }
        Dir[] calldata dirs = transaction.dirs;
        for (uint i; i < dirs.length; i++) {
            tax += dirs[i].value / 20;
        }
        adjustGenerator(generators['native'], tax);
    }

}