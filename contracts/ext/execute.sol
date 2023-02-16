// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.18;
import '../free/log2.sol';
import '../free/score.sol';
import '../free/updateFarm.sol';
import '../free/verify.sol';
import '../struct/ADISA.sol';
import '../struct/Request.sol';
import '../var/accs.sol';
import '../var/ADISA.sol';
import '../var/farms.sol';
contract hasExtExecute is hasVarADISA, hasVarAccs, hasVarFarms {
    function execute(Stream[] calldata streams, Work[] calldata works, 
    Proof[] calldata proofs) external {
        uint streamIndex;
        for (uint i; i < streams.length; i++)
            if (streams[i].chain == block.chainid) { streamIndex = i; break; }
        Stream calldata stream = streams[streamIndex];
        Request[] calldata requests = stream.requests;
        Output[] calldata outputs = stream.outputs;
        uint totalWork; uint maxRequestWork; uint requestInputs;
        uint outputValues; uint gas;
        for (uint i; i < requests.length; i++) {
            require(chunks[requests[i].id / 256] 
                & 1 << requests[i].id%256 == 0, 'input closed');
            for (uint j = i + 1; j < requests.length; j++)
                require(requests[i].id != requests[j].id,
                    'indistinct inputs');
            require(verify(keccak256(abi.encode(requests[i])), 
                stream.proofs[i], adisa.roots[stream.proofs[i].subtree]),
                    'input unverified');
            chunks[requests[i].id / 256] |= 1 << requests[i].id%256;
            if (requests[i].work > maxRequestWork)
                maxRequestWork = requests[i].work;
            requestInputs += requests[i].input;
            gas += requests[i].gas; }
        for (uint i; i < outputs.length; i++) {
            payable(outputs[i].recipient).transfer(outputs[i].value);
            outputValues += outputs[i].value; }
        Farm storage farm = farms['mine'];
        Gen storage gen = farm.gen;
        for (uint i; i < works.length; i++)
            totalWork += score(keccak256(abi.encode(works[i])));
        updateFarm(farm);
        for (uint i; i < works.length; i++) {
            require(verify(keccak256(i == 0 ? abi.encode(streams)
                : abi.encode(works[i - 1])), proofs[i], works[i].root),
                'workchain broken');
            address worker = works[i].worker;
            uint work;
            for (uint j; j < works.length; j++)
                if (works[j].worker == worker)
                    work +=score(keccak256(abi.encode(works[j])));
            Acc storage acc = accs['mine'][worker];
            uint points = work * gas / totalWork;
            acc.reward += acc.points * (farm.sigma - acc.sigma)
                / gen.valueScaler;
            acc.sigma = farm.sigma;
            farm.points += points;
            acc.points = points; }
        require(totalWork >= maxRequestWork, 'work insufficient');
        require(requestInputs == outputValues, 'first law broken');
        emit Execute(msg.sender, streams, works, proofs); }
    mapping (uint => uint) public chunks;
    event Execute(address executor, Stream[] stream, Work[] works, 
        Proof[] proofs); }
struct Output { address recipient; uint value; }
struct Stream { Request[] requests; Proof[] proofs; 
    Output[] outputs; uint chain; }
struct Work { bytes32 root; address worker; uint n; }