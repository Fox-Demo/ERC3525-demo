const { ethers, tracer } = require("hardhat");
const { expect } = require("chai");

let SFT, sft;
let deployer, user1, user2;

const tokenId = 1;
const slot = 1;
const value = 10000;

describe("SFT", function () {
  before(async function () {
    [deployer, user1, user2] = await ethers.getSigners();

    SFT = await ethers.getContractFactory("SFT");
  });

  beforeEach(async function () {
    sft = await SFT.deploy();
    await sft.deployed();
  });

  describe("Deployment", function () {
    it("Mint", async function () {
      const ownedToken = 1;

      await expect(sft.mint(user1.address, tokenId, slot, value)).to.not
        .reverted;
      expect(await sft.slotOf(tokenId)).to.equal(slot);
      expect(await sft["balanceOf(uint256)"](tokenId)).to.equal(value);
      expect(await sft["balanceOf(address)"](user1.address)).to.equal(
        ownedToken
      );
      expect(await sft.ownerOf(tokenId)).to.equal(user1.address);
    });

    it("Approve value", async function () {
      await expect(sft.mint(user1.address, tokenId, slot, value)).to.not
        .reverted;
      await expect(
        sft
          .connect(user1)
          ["approve(uint256,address,uint256)"](tokenId, user2.address, value)
      ).to.not.reverted;

      expect(await sft.allowance(tokenId, user2.address)).to.equal(value);
    });

    it("Approve token ownership", async function () {
      await expect(sft.mint(user1.address, tokenId, slot, value)).to.not
        .reverted;
      await expect(
        sft.connect(user1)["approve(address,uint256)"](user2.address, tokenId)
      ).to.not.reverted;

      expect(await sft.getApproved(tokenId)).to.equal(user2.address);
    });

    it("Transfer token value to user2", async function () {
      tracer.enable = true;

      await expect(sft.mint(user1.address, tokenId, slot, value)).to.not
        .reverted;

      await expect(
        sft
          .connect(user1)
          ["approve(uint256,address,uint256)"](tokenId, user2.address, value)
      ).to.not.reverted;

      //await expect(sft.connect(user2)["transferFrom(uint256,address,uint256)"](tokenId, user2.address, value)).to.not.reverted;

      await expect(
        sft
          .connect(user2)
          ["transferFrom(uint256,address,uint256)"](
            tokenId,
            user2.address,
            value
          )
      ).to.not.reverted;

      expect(await sft["balanceOf(uint256)"](tokenId)).to.equal(value);
    });
  });
});
