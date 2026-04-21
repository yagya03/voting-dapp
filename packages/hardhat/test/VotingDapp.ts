import { expect } from "chai";
import { ethers } from "hardhat";

describe("VotingDapp", function () {
  async function deployVotingDapp() {
    const [owner, voter1, voter2] = await ethers.getSigners();
    const VotingDapp = await ethers.getContractFactory("VotingDapp");
    const votingDapp = await VotingDapp.deploy();
    await votingDapp.waitForDeployment();

    return { votingDapp, owner, voter1, voter2 };
  }

  it("Should set the deployer as owner", async function () {
    const { votingDapp, owner } = await deployVotingDapp();
    expect(await votingDapp.owner()).to.equal(owner.address);
  });

  it("Should create a proposal", async function () {
    const { votingDapp } = await deployVotingDapp();

    await votingDapp.createProposal("Option A");

    const proposal = await votingDapp.getProposal(1);
    expect(proposal[1]).to.equal("Option A");
    expect(proposal[2]).to.equal(0);
  });

  it("Should allow a user to vote once", async function () {
    const { votingDapp, voter1 } = await deployVotingDapp();

    await votingDapp.createProposal("Option A");
    await votingDapp.connect(voter1).vote(1);

    const proposal = await votingDapp.getProposal(1);
    expect(proposal[2]).to.equal(1);
  });

  it("Should not allow double voting", async function () {
    const { votingDapp, voter1 } = await deployVotingDapp();

    await votingDapp.createProposal("Option A");
    await votingDapp.connect(voter1).vote(1);

    await expect(votingDapp.connect(voter1).vote(1)).to.be.revertedWith("You already voted");
  });

  it("Should not allow non-owner to create proposal", async function () {
    const { votingDapp, voter1 } = await deployVotingDapp();

    await expect(votingDapp.connect(voter1).createProposal("Option A")).to.be.revertedWith("Only owner can do this");
  });
});
