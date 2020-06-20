pragma solidity ^0.5.0;

contract Organization {
  enum ProposalType { Shareholder, Board }
  enum ProposalState { Open, EndedPassed, EndedLost }
  enum ProposalAction {
    ChangeShareholderQuorum,
    ChangeBoardQuorum,
    ChangeShareholderQuorumHours,
    ChangeBoardQuorumHours,
    AddBoardMember,
    RemoveBoardMember
  }

  struct ListLink {
    address prev;
    address next;
  }

  struct ProposalVote {
    address voter;
    uint48 amount;
  }

  struct Proposal {
    ProposalType proposalType;
    uint8 quorumNumerator;
    uint8 quorumDenominator;
    uint endTime;
    ProposalAction action;
    uint16[] intParams;
    address[] addressParams;
    ProposalState state;
    ProposalVote[] forVotes;
    ProposalVote[] againstVotes;
  }

  string public name;
  string public logoUrl;
  string public mission;

  uint32 public balanceInit;
  uint8 public balanceMultiplier;
  mapping (address => uint32) public balances;
  mapping (address => ListLink) public balanceAddresses;

  mapping (address => ListLink) public boardMembers;

  uint8 public shareholderQuorumNumerator;
  uint8 public shareholderQuorumDenominator;
  uint16 public shareholderQuorumHours;

  uint8 public boardQuorumNumerator;
  uint8 public boardQuorumDenominator;
  uint16 public boardQuorumHours;

  mapping(uint => Proposal) public proposals;
  uint public proposalsLength = 0;

	event Transfer(address indexed _from, address indexed _to, uint48 _value);

  constructor (
    string memory initName,
    string memory initLogoUrl,
    string memory initMission,
    uint32 startingShares
  ) public {
    name = initName;
    logoUrl = initLogoUrl;
    mission = initMission;

    balanceInit = startingShares;
    balanceMultiplier = 1;
    balances[msg.sender] = startingShares;
    balanceAddresses[address(0)] = ListLink(msg.sender, msg.sender);
    balanceAddresses[msg.sender] = ListLink(address(0), address(0));

    boardMembers[address(0)] = ListLink(msg.sender, msg.sender);
    boardMembers[msg.sender] = ListLink(address(0), address(0));

    shareholderQuorumNumerator = 1;
    shareholderQuorumDenominator = 1;
    shareholderQuorumHours = 72;

    boardQuorumNumerator = 1;
    boardQuorumDenominator = 1;
    boardQuorumHours = 24;
  }

	function sendShares(address receiver, uint48 amount) public returns(bool sufficient) {
    if (amount < 1) return false;

    uint32 baseAmount = uint32(amount / balanceMultiplier);

    if (balances[msg.sender] < baseAmount) return false;

		balances[msg.sender] -= baseAmount;
    if (balances[msg.sender] < 1) {
      delete balances[msg.sender];
      balanceAddresses[balanceAddresses[msg.sender].prev].next = balanceAddresses[msg.sender].next;
      balanceAddresses[balanceAddresses[msg.sender].next].prev = balanceAddresses[msg.sender].prev;
      delete balanceAddresses[msg.sender];
    }

    if (balances[receiver] < 1) {
      address lastShareholder = balanceAddresses[address(0)].prev;
      balanceAddresses[address(0)].prev = receiver;
      balanceAddresses[receiver] = ListLink(lastShareholder, address(0));
      balanceAddresses[lastShareholder].next = receiver;
    }
		balances[receiver] += baseAmount;

		emit Transfer(msg.sender, receiver, amount);

    return true;
	}

  function move(
    ProposalAction action,
    uint16[] memory intParams,
    address[] memory addressParams
  ) public returns (uint) {
    ProposalType proposalType;

    // set proposal type based on action
    if (
      action == ProposalAction.ChangeShareholderQuorum ||
      action == ProposalAction.ChangeShareholderQuorumHours ||
      action == ProposalAction.AddBoardMember ||
      action == ProposalAction.RemoveBoardMember
    ) {
      proposalType = ProposalType.Shareholder;
    } else if (
      action == ProposalAction.ChangeBoardQuorum ||
      action == ProposalAction.ChangeBoardQuorumHours
    ) {
      proposalType = ProposalType.Board;
    } else {
      revert('Unexpected proposal action.');
    }

    // ensure that params are in sync with ProposalAction
    require(
      (
        action == ProposalAction.ChangeShareholderQuorum ||
        action == ProposalAction.ChangeBoardQuorum &&
        intParams.length == 2 &&
        addressParams.length == 0
      ) || (
        action == ProposalAction.ChangeShareholderQuorumHours ||
        action == ProposalAction.ChangeBoardQuorumHours &&
        intParams.length == 1 &&
        addressParams.length == 0
      ) || (
        action == ProposalAction.AddBoardMember ||
        action == ProposalAction.RemoveBoardMember &&
        intParams.length == 0 &&
        addressParams.length == 1
      ),
      'Invalid parameters specified for proposal action'
    );

    // don't allow board member removal if there's only one board member
    require(action != ProposalAction.RemoveBoardMember || countBoardMembers() > 1, 'Cannot vote to remove last board member.');

    // determine votes needed for quorum
    uint48 quorumVotes = 0;
    if (proposalType == ProposalType.Shareholder) {
      // shareholder vote. Count shares as votes.
      quorumVotes = uint48(balanceInit) * uint48(balanceMultiplier) * (uint48(shareholderQuorumNumerator) / uint48(shareholderQuorumDenominator));
    } else {
      // board vote. Count addresses as votes.
      quorumVotes = uint48(countBoardMembers()) * (uint48(boardQuorumNumerator) / uint48(boardQuorumDenominator));
    }

    uint proposalIndex = ++proposalsLength;

    proposals[proposalIndex].proposalType = proposalType;
    proposals[proposalIndex].quorumNumerator = proposalType == ProposalType.Shareholder ? shareholderQuorumNumerator : boardQuorumNumerator;
    proposals[proposalIndex].quorumDenominator = proposalType == ProposalType.Shareholder ? shareholderQuorumDenominator : boardQuorumDenominator;
    proposals[proposalIndex].endTime = proposalType == ProposalType.Shareholder ? now + shareholderQuorumHours  * 3600 : now + boardQuorumHours * 3600;
    proposals[proposalIndex].action = action;
    proposals[proposalIndex].intParams = intParams;
    proposals[proposalIndex].addressParams = addressParams;
    proposals[proposalIndex].state = ProposalState.Open;

    return proposalIndex;
  }

  function vote(uint proposalId, bool isFor) public {
    require(proposals[proposalId].state == ProposalState.Open, 'Proposal has ended.');

    bool hasVoted = false;

    for (uint i = 0; i < proposals[proposalId].forVotes.length; i++) {
      if (proposals[proposalId].forVotes[i].voter == msg.sender) {
        hasVoted = true;
        break;
      }
    }

    if(!hasVoted) {
      for (uint i = 0; i < proposals[proposalId].againstVotes.length; i++) {
        if (proposals[proposalId].againstVotes[i].voter == msg.sender) {
          hasVoted = true;
          break;
        }
      }
    }

    require(!hasVoted, "Caller has already voted on this proposal.");

    if(proposals[proposalId].proposalType == ProposalType.Shareholder) {
      // shareholder vote. The shares count.
      if (isFor) {
        proposals[proposalId].forVotes.push(ProposalVote(msg.sender, balances[msg.sender]));
      } else {
        proposals[proposalId].againstVotes.push(ProposalVote(msg.sender, balances[msg.sender]));
      }
    } else {
      // board vote. address counts as one.
      if (isFor) {
        proposals[proposalId].forVotes.push(ProposalVote(msg.sender, 1));
      } else {
        proposals[proposalId].againstVotes.push(ProposalVote(msg.sender, 1));
      }
    }
  }

  function resolveProposal(uint proposalId) public returns (ProposalState /* resulting state */) {
    require(proposals[proposalId].state == ProposalState.Open, 'Proposal has already resolved and ended.');

    uint forVotes = 0;
    uint againstVotes = 0;
    uint totalPossibleVotes = 0;

    // check votes
    if (proposals[proposalId].proposalType == ProposalType.Shareholder) {
      // shareholder vote. Count shares as votes.
      for (uint i = 0; i < proposals[proposalId].forVotes.length; i++) {
        forVotes += proposals[proposalId].forVotes[i].amount;
      }

      for (uint i = 0; i < proposals[proposalId].againstVotes.length; i++) {
        againstVotes += proposals[proposalId].againstVotes[i].amount;
      }

      totalPossibleVotes = balanceInit * balanceMultiplier;
    } else {
      // board vote. Count addresses as votes.
      forVotes = uint48(proposals[proposalId].forVotes.length);
      againstVotes = uint48(proposals[proposalId].againstVotes.length);
      totalPossibleVotes = countBoardMembers();
    }

    if (now < proposals[proposalId].endTime && forVotes + againstVotes < totalPossibleVotes) {
      // proposal is still open
      return ProposalState.Open;
    }

    // determine whether proposal has reached quorum
    if (forVotes + againstVotes < totalPossibleVotes * proposals[proposalId].quorumNumerator / proposals[proposalId].quorumDenominator) {
      // proposal did not reach quorum
      return ProposalState.EndedLost;
    }

    // determine whether proposal has passed
    ProposalAction action = proposals[proposalId].action;
    if (
      action == ProposalAction.ChangeShareholderQuorum ||
      action == ProposalAction.ChangeBoardQuorum ||
      action == ProposalAction.ChangeShareholderQuorumHours ||
      action == ProposalAction.ChangeBoardQuorumHours ||
      action == ProposalAction.AddBoardMember ||
      action == ProposalAction.RemoveBoardMember
    ) {
      // two-thirds vote is required to pass
      // multiply forVotes (numerator) against 3 (votes required denominator) and compare against
      // 2 (votes required numerator) times totalPossibleVotes (denominator)
      if (forVotes * 3 < 2 * totalPossibleVotes) {
        // proposal did not pass
        return ProposalState.EndedLost;
      }
    } else {
      revert('proposal action is not expected.');
    }

    // vote has passed. move forward with resolution logic
    if (action == ProposalAction.ChangeShareholderQuorum) {
      shareholderQuorumNumerator = uint8(proposals[proposalId].intParams[0]);
      shareholderQuorumDenominator = uint8(proposals[proposalId].intParams[1]);
    } else if (action == ProposalAction.ChangeBoardQuorum) {
      boardQuorumNumerator = uint8(proposals[proposalId].intParams[0]);
      boardQuorumDenominator = uint8(proposals[proposalId].intParams[1]);
    } else if (action == ProposalAction.ChangeShareholderQuorumHours) {
      shareholderQuorumHours = proposals[proposalId].intParams[0];
    } else if (action == ProposalAction.ChangeBoardQuorumHours) {
      boardQuorumHours = proposals[proposalId].intParams[0];
    } else if (action == ProposalAction.AddBoardMember) {
      address lastBoardMember = boardMembers[address(0)].prev;
      boardMembers[address(0)].prev = proposals[proposalId].addressParams[0];
      boardMembers[proposals[proposalId].addressParams[0]] = ListLink(lastBoardMember, address(0));
      boardMembers[lastBoardMember].next = proposals[proposalId].addressParams[0];
    } else if (action == ProposalAction.RemoveBoardMember) {
      // don't allow board member removal if there's only one board member
      if (countBoardMembers() < 1) {
        revert('Proposal has passed, but cannot remove last board member.');
      }

      address toRemove = proposals[proposalId].addressParams[0];

      boardMembers[boardMembers[toRemove].prev].next = boardMembers[toRemove].next;
      boardMembers[boardMembers[toRemove].next].prev = boardMembers[toRemove].prev;
      delete boardMembers[toRemove];
    } else {
      revert('proposal action is not expected.');
    }

    return ProposalState.EndedPassed;
  }

  function countBoardMembers() public view returns (uint) {
    ListLink memory boardMember = boardMembers[address(0)];
    uint boardMemberCount = 0;

    do {
      boardMember = boardMembers[boardMember.next];
      boardMemberCount++;
    } while (boardMember.next != address(0));

    return boardMemberCount;
  }
}
