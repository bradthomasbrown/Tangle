// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.17;

import '../ERC20/ERC20.sol';
import '../Farmable/Farmable.sol';
import '../GentleMidnight/GentleMidnight.sol';
import './vars/MinBal.sol';

contract Tangle is
ERC20,
Farmable,
GentleMidnight,
hasVarMinBal,
hasVarAirdropAmount
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
        move(address(this), address(liquidity), balanceOf, generator, minBal, [address(0), msg.sender], initSupply);
        move(address(this), address(liquidity), balanceOf, generator, minBal, [address(0), address(this)], finalSupply - initSupply);
        // Farmable init
        generator.M = finalSupply - initSupply;
        generator.C = 14016000;
        generator.T = [block.timestamp, block.timestamp];
        generator.farms['hold'].N = 16;
        generator.farms['airdrop'].N = 16;
        generator.farms['stake'].N = 16;
        generator.farms['GentleMidnight'].N = 52;
        generator.D = 100;
        generator.S = 1e32;
        // Tangle init
        owner = msg.sender;
        minBal = 1;
        airdropAmount = 1e9;
    }

    function setLiquidity(address _liquidity) external
    {
        require(msg.sender == owner);
        liquidity = ERC20(_liquidity);
    }

    function setMinBal(uint _minBal) external
    {
        require(msg.sender == owner);
        minBal = _minBal;
    }

    function setAirdropAmount(uint _airdropAmount) external
    {
        require(msg.sender == owner);
        airdropAmount = _airdropAmount;
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