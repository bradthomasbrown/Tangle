// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ERC20/ERC20.sol';
import '../Farmable/Farmable.sol';
import '../GentleMidnight/GentleMidnight.sol';

contract Tangle is
ERC20,
Farmable,
GentleMidnight
{
    
    address public owner;

    constructor()
    {
        // ERC20 init
        name = "Tangle";
        symbol = "TNGL";
        decimals = 9;
        uint finalSupply = 1e9 * 10 ** decimals;
        uint initSupply = finalSupply / 10;
        totalSupply = initSupply;
        balanceOf[msg.sender] += initSupply;
        // Farmable init
        generator.M = finalSupply - initSupply;
        generator.C = 14016000;
        generator.T = [block.timestamp, block.timestamp];
        generator.farms['airdrop'].N = 1;
        generator.farms['airdrop'].D = 10;
        generator.farms['stake'].N = 3;
        generator.farms['stake'].D = 10;
        generator.farms['GentleMidnight'].N = 6;
        generator.farms['GentleMidnight'].D = 10;
        // Tangle init
        owner = msg.sender;
    }

    function setLiquidity(address _liquidity) external
    {
        require(msg.sender == owner);
        liquidity = ERC20(_liquidity);
    }

    function count() external view returns (uint)
    {
       return adisa.count;
    }

    function roots() external view returns (bytes32[] memory _roots)
    {
        uint c = log2(adisa.count) + 1;
        _roots = new bytes32[](c);
        for (uint i; i < c; i++) _roots[i] = adisa.roots[i];
    }

    function _now() external view returns (uint)
    {
        return block.timestamp;
    }

}