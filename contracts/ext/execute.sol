// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../enum/FarmID.sol';
import '../free/log2.sol';
import '../free/score.sol';
import '../free/updateFarm.sol';
import '../free/verify.sol';
import '../int/insertReq.sol';
import '../var/accs.sol';
import '../var/farms.sol';
contract hasExtExecute is hasVarAccs, hasIntInsertReq, hasVarFarms {
    function execute(Stream[] calldata streams, Work[] calldata works, 
    Proof[] calldata proofs) external {
        uint streamIndex;
        for (uint i; i < streams.length; i++)
            if (streams[i].chain == block.chainid) { streamIndex = i; break; }
        Stream calldata stream = streams[streamIndex];
        Input[] calldata inputs = stream.inputs;
        Output[] calldata outputs = stream.outputs;
        uint totalWork; uint maxReqWork; uint reqInputs;
        uint outputValues; uint gas; uint count; uint rollGas; uint rollCount;
        for (uint i; i < inputs.length; i++) {
            Input calldata input = inputs[i];
            Req calldata req = input.req;
            require(chunks[req.id / 256]
                & 1 << req.id%256 == 0, 'input closed');
            for (uint j = i + 1; j < inputs.length; j++)
                require(req.id != inputs[j].req.id, 'indistinct inputs');
            require(verify(keccak256(abi.encode(req)),
                input.proof, adisa.roots[input.proof.subtree]),
                    'input unverified');
            chunks[req.id / 256] |= 1 << req.id%256;
            if (req.work > maxReqWork)
                maxReqWork = req.work;
            reqInputs += req.input - input.subtrahend;
            if (input.subtrahend != req.input) {
                gas += req.gas * (req.input - input.subtrahend)
                    / req.input;
                count++; }}
        for (uint i; i < inputs.length; i++) {
            Input calldata input = inputs[i];
            Req calldata req = input.req;
            if (input.subtrahend > 0) {
                Req memory roll = req;
                roll.gas = req.gas - req.gas 
                    * (req.input - input.subtrahend) / req.input;
                rollGas += roll.gas;
                roll.input = input.subtrahend;
                roll.output = input.newOutput;
                roll.id = adisa.count++;
                insertReq(roll);
                rollCount++; }}
        for (uint i; i < outputs.length; i++) {
            payable(outputs[i].recipient).transfer(outputs[i].value);
            outputValues += outputs[i].value; }
        for (uint i; i < works.length; i++)
            totalWork += score(keccak256(abi.encode(works[i])));
        Farm storage mineFarm = farms[FarmID.MINE];
        Gen storage mineGen = mineFarm.gen;
        Farm storage rollFarm = farms[FarmID.ROLL];
        Gen storage rollGen = rollFarm.gen;
        for (uint i; i < works.length; i++) {
            if (i == 0) updateFarm(mineFarm);
            require(verify(keccak256(i == 0 ? abi.encode(streams)
                : abi.encode(works[i - 1])), proofs[i], works[i].root),
                'workchain broken');
            address worker = works[i].worker;
            uint work;
            for (uint j; j < works.length; j++)
                if (works[j].worker == worker)
                    work += score(keccak256(abi.encode(works[j])));
            Acc storage mineAcc = accs[FarmID.MINE][worker];
            uint points = work * gas / totalWork;
            if (points < count) points = count;
            mineAcc.reward += mineAcc.points
                * (mineFarm.sigma - mineAcc.sigma) / mineGen.valueScaler;
            mineAcc.sigma = mineFarm.sigma;
            mineFarm.points += points;
            mineAcc.points += points;
            Acc storage rollAcc = accs[FarmID.ROLL][worker];
            if (rollCount > 0) {
                if (i == 0) updateFarm(rollFarm);
                uint rollPoints = work * rollGas / totalWork;
                if (rollPoints < rollCount) rollPoints = rollCount;
                rollAcc.reward += rollAcc.points
                    * (rollFarm.sigma - rollAcc.sigma) / rollGen.valueScaler;
                rollAcc.sigma = rollFarm.sigma;
                rollFarm.points += rollPoints;
                rollAcc.points += rollPoints; }}
        require(totalWork >= maxReqWork, 'work insufficient');
        require(reqInputs == outputValues, 'first law broken');
        emit Execute(msg.sender, streams, works, proofs); }
    mapping (uint => uint) public chunks;
    event Execute(address executor, Stream[] stream, Work[] works, 
        Proof[] proofs); }
struct Input { Req req; Proof proof; uint subtrahend; uint newOutput; }
struct Output { address recipient; uint value; }
struct Stream { Input[] inputs; Output[] outputs; uint chain; }
struct Work { bytes32 root; address worker; uint n; }