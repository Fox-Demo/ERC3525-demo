//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {IERC3525} from "@solvprotocol/erc-3525/IERC3525.sol";
import {SFT} from "../contracts/SFT.sol";

contract SFTTest is Test{
    //Constant
    uint256 public constant TOKEN_ID = 1;
    uint256 public constant SLOT = 1;
    uint256 public constant VALUE = 10000;
    address public constant TO = 0xF6eDd09eea465195D47c4653A50e320618cfbd7e;
    uint256 public constant APPROVED_VALUE = 1000;

    SFT sft;

    function setUp() external {
        sft = new SFT();
    }

    struct UserInfo{
        address addr;
        uint256 balance;
    }

    struct TokenInfo{
        uint256 id;
        uint256 slot;
        uint256 value;
    }

    function _checkTokeInfonAndUserInfoRelation(UserInfo memory _user, TokenInfo memory _token) internal {
        assertEq(sft.slotOf(_token.id), _token.slot);
        assertEq(sft.balanceOf(_token.id), _token.value);
        assertEq(sft.balanceOf(_user.addr), _user.balance);
        assertEq(sft.ownerOf(_token.id), _user.addr);
    }

    function testMint() external {
        UserInfo memory owner;
        TokenInfo memory token;

        sft.mint(address(this), SLOT, VALUE);
        owner = UserInfo(address(this), 1);
        token = TokenInfo(TOKEN_ID, SLOT, VALUE);
        _checkTokeInfonAndUserInfoRelation(owner, token);

        sft.mint(address(this), SLOT, VALUE-5000);
        owner = UserInfo(address(this), 2);
        token = TokenInfo(TOKEN_ID+1, SLOT, VALUE-5000);
        _checkTokeInfonAndUserInfoRelation(owner, token);
    }

    function testApproveTokenValueToOtherUser() external {
        sft.mint(address(this), SLOT, VALUE);
        sft.approve(TOKEN_ID, TO, APPROVED_VALUE);
        assertEq(sft.allowance(TOKEN_ID, TO), APPROVED_VALUE);
    }

    function testApproveTokenOwnershipToOtherUser() external{
        sft.mint(address(this), SLOT, VALUE);
        sft.approve(TO, TOKEN_ID);
        assertEq(sft.getApproved(TOKEN_ID), TO);
    }


    function testTransferTokenValueToOtherUser() external{
        UserInfo memory owner;
        TokenInfo memory token;

        uint256 newTokenId = TOKEN_ID + 1;
        uint256 transferdValue = APPROVED_VALUE;

        sft.mint(address(this), SLOT, VALUE);
        sft.approve(TOKEN_ID, TO, APPROVED_VALUE);

        vm.prank(TO);
        sft.transferFrom(TOKEN_ID, TO, APPROVED_VALUE);

        owner = UserInfo(TO, 1);
        token = TokenInfo(newTokenId, SLOT, transferdValue);
        _checkTokeInfonAndUserInfoRelation(owner, token);
        assertEq(sft.allowance(TOKEN_ID, TO), 0);
    }

    function testTransferTokenValueToOtherToken() external{
        UserInfo memory owner;
        TokenInfo memory token;
        uint256 newTokenId = TOKEN_ID + 1;
        uint256  newTokenValue = 1000;

        sft.mint(address(this), SLOT, VALUE);

        vm.prank(TO);
        sft.mint(TO, SLOT, newTokenValue);
        
        sft.approve(TOKEN_ID, TO, APPROVED_VALUE);

        vm.prank(TO);
        sft.transferFrom(TOKEN_ID, newTokenId, APPROVED_VALUE);

        owner = UserInfo(TO, 1);
        token = TokenInfo(newTokenId, SLOT, newTokenValue + APPROVED_VALUE);
        _checkTokeInfonAndUserInfoRelation(owner, token);

        owner = UserInfo(address(this), 1);
        token = TokenInfo(TOKEN_ID, SLOT, VALUE - APPROVED_VALUE);
        _checkTokeInfonAndUserInfoRelation(owner, token);

        assertEq(sft.allowance(TOKEN_ID, TO), 0);
    }

    function testTransferTokenOwnershipToOtherUser() external{
        UserInfo memory owner;
        TokenInfo memory token;

        sft.mint(address(this), SLOT, VALUE);
        sft.approve(TO, TOKEN_ID);

        vm.prank(TO);
        sft.transferFrom(address(this), TO, TOKEN_ID);

        owner = UserInfo(TO, 1);
        token = TokenInfo(TOKEN_ID, SLOT, VALUE);
        _checkTokeInfonAndUserInfoRelation(owner, token);
        assertFalse(sft.ownerOf(TOKEN_ID) == address(this));
    }

    function testTransferTokenValueWhenApproveOwnership() external{
        UserInfo memory owner;
        TokenInfo memory token;

        sft.mint(address(this), SLOT, VALUE);
        sft.approve(TO, TOKEN_ID);

        vm.prank(TO);
        sft.transferFrom(TOKEN_ID, TO, APPROVED_VALUE);

        owner = UserInfo(TO, 1);
        token = TokenInfo(TOKEN_ID+1, SLOT, APPROVED_VALUE);
        _checkTokeInfonAndUserInfoRelation(owner, token);
    }
}
