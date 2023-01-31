// SPDX-License-Identifier: 0BSD
pragma solidity ^0.8.17;

import '../structs/Account.sol';

contract hasVarAccounts {

    mapping(string => mapping(address => Account)) public accounts;

}