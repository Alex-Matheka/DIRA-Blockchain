// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract DIRAVoting {

    struct Election {
       bytes32 administratorId;
        bool isOpen;
    }

    mapping(string => Election) public elections;

    // Tracks whether a pseudonymous voter has voted in an election
    mapping(string => mapping(bytes32 => bool)) public hasVoted;

    // Tracks the total number of recorded votes per election
    mapping(string => uint256) public voteCount;
 

    //vote-recording event
    event VoteRecorded(
    string electionId,
    bytes32 nullifier,
    bytes32 ballotCommitment
     );

     //recordVote function
     function recordVote(
    string memory _electionId,
    bytes32 _nullifier,
    bytes32 _ballotCommitment
    )   public {

    require(msg.sender == authorizedBackend, "Not authorized");

    require(
        elections[_electionId].administratorId != bytes32(0),
        "Election does not exist"
    );

    require(
        elections[_electionId].isOpen,
        "Election is closed"
    );

    require(_nullifier != bytes32(0), "Invalid nullifier");

    require(
        _ballotCommitment != bytes32(0),
        "Invalid ballot commitment"
    );

    require(
        !hasVoted[_electionId][_nullifier],
        "Already voted"
    );

    hasVoted[_electionId][_nullifier] = true;

    voteCount[_electionId]++;

    emit VoteRecorded(
        _electionId,
        _nullifier,
        _ballotCommitment
    );
  }


    address public authorizedBackend;
    constructor() {
    authorizedBackend = msg.sender;
} 

// create election function
function createElection(string memory _electionId,
    bytes32 _administratorId) public {

    require(msg.sender == authorizedBackend, "Not authorized");
    require(bytes(_electionId).length > 0, "Invalid election ID");

    require(_administratorId != bytes32(0), "Invalid administrator ID");

    require(
        elections[_electionId].administratorId == bytes32(0),
        "Election already exists"
    );

    elections[_electionId].administratorId = _administratorId;

    elections[_electionId].isOpen = false;

}

// open election function

function openElection(string memory _electionId) public {

    require(msg.sender == authorizedBackend, "Not authorized");

    require(
        elections[_electionId].administratorId != bytes32(0),
        "Election does not exist"
    );

    require(
        !elections[_electionId].isOpen,
        "Election already open"
    );

    elections[_electionId].isOpen = true;
}

//close election

function closeElection(string memory _electionId) public {

    require(msg.sender == authorizedBackend, "Not authorized");

    require(
        elections[_electionId].administratorId != bytes32(0),
        "Election does not exist"
    );

    require(
        elections[_electionId].isOpen,
        "Election already closed"
    );

    elections[_electionId].isOpen = false;
}



}

 