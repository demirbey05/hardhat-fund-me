// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FunWithStorage {
    uint256 favoriteNumber; // Stored at slot 0
    bool someBool; // stored at slot 1
    uint256[] myArray; /* Array length stored at the slot 2 
    but the object will be the keccak256(2), since 2 is the storage slot of the array*/ // @title A title that should describe the contract/interface
    mapping(uint256 => bool) myMap; /* An empty slot is held at slot 3
    and the elements will be stored at keccak256(h(k) . p)
    p: The storage slot (aka, 3)
    k: The key in hex
    h: Some function based on the type. For uint256, it just pads the hex
    */

    // Constant and immutable variables don't store in storage

    uint256 constant NOT_IN_STORAGE = 123;
    uint256 immutable i_not_storage;

    constructor() {
        favoriteNumber = 25; //SSTORE Save word to storage	(word = 256 bit) 800 gas
        someBool = true; // SSTORE
        myArray.push(222); // SSTORE
        myMap[0] = true; // SSTORE
        i_not_storage = 123;
    }

    function doStuff() public {
        uint256 newVar = favoriteNumber + 1; //SLOAD Load word from storage(word = 256 bit) 20000 gas
        bool otherVar = someBool; // SLOAD
    }
}
