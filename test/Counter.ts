import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

 describe("DIRAVoting", function () {
  //test 1
  it("Should allow the backend to create an election", async function () {
    const [backend, user] = await ethers.getSigners();
    const dira = await ethers.deployContract("DIRAVoting");

    const electionId = "ELECTION001";
    const administratorId = ethers.encodeBytes32String("ADMIN001");
    
    await dira.createElection(electionId, administratorId);

    const election = await dira.elections(electionId);

    expect(election.administratorId).to.equal(administratorId);
    expect(election.isOpen).to.equal(false);
  });
  //test 2

  it("Should prevent unauthorized users from creating elections", async function () {
 
   const [backend, user] = await ethers.getSigners();
   const dira = await ethers.deployContract("DIRAVoting");

   await expect(dira.connect(user).createElection("ELECTION002", ethers.encodeBytes32String("ADMIN002"))
     ).to.be.revertedWith("Not authorized");
});

// test3
it("Should prevent duplicate election IDs", async function () {
  const [backend] = await ethers.getSigners();
  const dira = await ethers.deployContract("DIRAVoting");

  const electionId = "ELECTION001";

  await dira.createElection(
  electionId,
  ethers.encodeBytes32String("ADMIN001")
);

  await expect(dira.createElection(
    electionId,
    ethers.encodeBytes32String("ADMIN002")
  )).to.be.revertedWith("Election already exists");
});

//test 4
it("Should reject an invalid administrator ID", async function () {
  const [backend] = await ethers.getSigners();
  const dira = await ethers.deployContract("DIRAVoting") 

  const electionId = "ELECTION001";
  const administratorId = ethers.ZeroHash;// Invalid administrator ID
 
  await expect(dira.createElection(electionId, administratorId)).to.be.revertedWith("Invalid administrator ID");
});

//test 5
it("Should reject empty election ID's", async function () {
  const [backend] = await ethers.getSigners();
  const dira = await ethers.deployContract("DIRAVoting");

  const electionId = ""; // Empty election ID
  const administratorId = ethers.encodeBytes32String("ADMIN001");

  await expect(dira.createElection(electionId, administratorId)).to.be.revertedWith("Invalid election ID");


});

//test 6
it("Should allow the backend to open an election", async function () {
    const dira = await ethers.deployContract("DIRAVoting");

    const electionId = "ELECTION001";
    const administratorId = ethers.encodeBytes32String("ADMIN001");

    await dira.createElection(electionId, administratorId);
    await dira.openElection(electionId);

    const election = await dira.elections(electionId);

    expect(election.isOpen).to.equal(true);
});

//TEST 7
it("Should allow the backend to close an election", async function () {
    const dira = await ethers.deployContract("DIRAVoting");

    const electionId = "ELECTION001";
    const administratorId = ethers.encodeBytes32String("ADMIN001");

    await dira.createElection(electionId, administratorId);
    await dira.openElection(electionId);
    await dira.closeElection(electionId);

    const election = await dira.elections(electionId);

    expect(election.isOpen).to.equal(false);
});

//test 8
it("Should prevent unauthorized users from opening an election", async function () {
    const [backend, user] = await ethers.getSigners();
    const dira = await ethers.deployContract("DIRAVoting");

    const electionId = "ELECTION001";
    const administratorId = ethers.encodeBytes32String("ADMIN001");

    await dira.createElection(electionId, administratorId);

    await expect(
        dira.connect(user).openElection(electionId)
    ).to.be.revertedWith("Not authorized");
});

//test 9
it("Should prevent opening a non-existent election", async function () {
    const dira = await ethers.deployContract("DIRAVoting");

    await expect(
        dira.openElection("UNKNOWN001")
    ).to.be.revertedWith("Election does not exist");
});

//test 10
it("Should prevent opening an already open election", async function () {
    const dira = await ethers.deployContract("DIRAVoting");

    const electionId = "ELECTION001";
    const administratorId = ethers.encodeBytes32String("ADMIN001");

    await dira.createElection(electionId, administratorId);
    await dira.openElection(electionId);

    await expect(
        dira.openElection(electionId)
    ).to.be.revertedWith("Election already open");
});


//test 11
it("Should prevent closing an already closed election", async function () {
    const dira = await ethers.deployContract("DIRAVoting");

    const electionId = "ELECTION001";
    const administratorId = ethers.encodeBytes32String("ADMIN001");

    await dira.createElection(electionId, administratorId);

    await expect(
        dira.closeElection(electionId)
    ).to.be.revertedWith("Election already closed");
});

//test 12
it("Should allow the backend to record a vote", async function () {
    const dira = await ethers.deployContract("DIRAVoting");

    const electionId = "ELECTION001";
    const adminId = ethers.encodeBytes32String("ADMIN001");
    const nullifier = ethers.encodeBytes32String("VOTER001");
    const commitment = ethers.encodeBytes32String("BALLOT001");

    await dira.createElection(electionId, adminId);
    await dira.openElection(electionId);

    await dira.recordVote(electionId, nullifier, commitment);

    expect(await dira.hasVoted(electionId, nullifier)).to.equal(true);
    expect(await dira.voteCount(electionId)).to.equal(1n);
});

//test 13
it("Should prevent a voter from voting twice", async function () {
    const dira = await ethers.deployContract("DIRAVoting");

    const electionId = "ELECTION001";
    const adminId = ethers.encodeBytes32String("ADMIN001");
    const nullifier = ethers.encodeBytes32String("VOTER001");
    const commitment = ethers.encodeBytes32String("BALLOT001");

    await dira.createElection(electionId, adminId);
    await dira.openElection(electionId);

    await dira.recordVote(electionId, nullifier, commitment);

    await expect(
        dira.recordVote(electionId, nullifier, commitment)
    ).to.be.revertedWith("Already voted");
});

//test 14
it("Should reject votes when an election is closed", async function () {
    const dira = await ethers.deployContract("DIRAVoting");

    const electionId = "ELECTION001";
    const adminId = ethers.encodeBytes32String("ADMIN001");
    const nullifier = ethers.encodeBytes32String("VOTER001");
    const commitment = ethers.encodeBytes32String("BALLOT001");

    await dira.createElection(electionId, adminId);

    await expect(
        dira.recordVote(electionId, nullifier, commitment)
    ).to.be.revertedWith("Election is closed");
});

//test 15
it("Should prevent unauthorized users from recording votes", async function () {
    const [backend, user] = await ethers.getSigners();
    const dira = await ethers.deployContract("DIRAVoting");

    const electionId = "ELECTION001";
    const adminId = ethers.encodeBytes32String("ADMIN001");
    const nullifier = ethers.encodeBytes32String("VOTER001");
    const commitment = ethers.encodeBytes32String("BALLOT001");

    await dira.createElection(electionId, adminId);
    await dira.openElection(electionId);

    await expect(
        dira.connect(user).recordVote(electionId, nullifier, commitment)
    ).to.be.revertedWith("Not authorized");
});

//test 16
it("Should reject an invalid ballot commitment", async function () {
    const dira = await ethers.deployContract("DIRAVoting");

    const electionId = "ELECTION001";
    const adminId = ethers.encodeBytes32String("ADMIN001");
    const nullifier = ethers.encodeBytes32String("VOTER001");

    await dira.createElection(electionId, adminId);
    await dira.openElection(electionId);

    await expect(
        dira.recordVote(electionId, nullifier, ethers.ZeroHash)
    ).to.be.revertedWith("Invalid ballot commitment");
});

//test 17
it("Should reject an invalid nullifier", async function () {
    const dira = await ethers.deployContract("DIRAVoting");

    const electionId = "ELECTION001";
    const adminId = ethers.encodeBytes32String("ADMIN001");
    const commitment = ethers.encodeBytes32String("BALLOT001");

    await dira.createElection(electionId, adminId);
    await dira.openElection(electionId);

    await expect(
        dira.recordVote(electionId, ethers.ZeroHash, commitment)
    ).to.be.revertedWith("Invalid nullifier");
});

//test 18
it("Should emit VoteRecorded when a vote is recorded", async function () {
    const dira = await ethers.deployContract("DIRAVoting");

    const electionId = "ELECTION001";
    const adminId = ethers.encodeBytes32String("ADMIN001");
    const nullifier = ethers.encodeBytes32String("VOTER001");
    const commitment = ethers.encodeBytes32String("BALLOT001");

    await dira.createElection(electionId, adminId);
    await dira.openElection(electionId);

    await expect(
        dira.recordVote(electionId, nullifier, commitment)
    )
        .to.emit(dira, "VoteRecorded")
        .withArgs(electionId, nullifier, commitment);
});


//test 19
it("Should allow the same voter to vote in a different election", async function () {
    const dira = await ethers.deployContract("DIRAVoting");

    const adminId = ethers.encodeBytes32String("ADMIN001");
    const nullifier = ethers.encodeBytes32String("VOTER001");
    const commitment = ethers.encodeBytes32String("BALLOT001");

    await dira.createElection("ELECTION001", adminId);
    await dira.createElection("ELECTION002", adminId);

    await dira.openElection("ELECTION001");
    await dira.openElection("ELECTION002");

    await dira.recordVote("ELECTION001", nullifier, commitment);
    await dira.recordVote("ELECTION002", nullifier, commitment);

    expect(await dira.voteCount("ELECTION001")).to.equal(1n);
    expect(await dira.voteCount("ELECTION002")).to.equal(1n);
});



});
  
