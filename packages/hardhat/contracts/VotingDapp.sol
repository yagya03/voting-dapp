// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract VotingDapp {
    address public owner;
    uint256 public proposalCount;

    struct Proposal {
        uint256 id;
        string name;
        uint256 voteCount;
        bool exists;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed id, string name);
    event Voted(address indexed voter, uint256 indexed proposalId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can do this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createProposal(string memory _name) public onlyOwner {
        require(bytes(_name).length > 0, "Proposal name cannot be empty");

        proposalCount++;

        proposals[proposalCount] = Proposal({ id: proposalCount, name: _name, voteCount: 0, exists: true });

        emit ProposalCreated(proposalCount, _name);
    }

    function vote(uint256 _proposalId) public {
        require(proposals[_proposalId].exists, "Proposal does not exist");
        require(!hasVoted[msg.sender][_proposalId], "You already voted");

        proposals[_proposalId].voteCount++;
        hasVoted[msg.sender][_proposalId] = true;

        emit Voted(msg.sender, _proposalId);
    }

    function getProposal(uint256 _proposalId) public view returns (uint256, string memory, uint256) {
        require(proposals[_proposalId].exists, "Proposal does not exist");
        Proposal memory proposal = proposals[_proposalId];
        return (proposal.id, proposal.name, proposal.voteCount);
    }

    function getAllProposals() public view returns (Proposal[] memory) {
        Proposal[] memory result = new Proposal[](proposalCount);

        for (uint256 i = 1; i <= proposalCount; i++) {
            result[i - 1] = proposals[i];
        }

        return result;
    }
}
