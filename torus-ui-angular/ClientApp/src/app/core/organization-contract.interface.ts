export type bigNumber = { toNumber: () => number; };

export interface OrganizationContractListLink {
  prev: string;
  next: string;
}

export interface OrganizationContractProposalVote {
  voter: string;
  amount: bigNumber;
}

export interface OrganizationContractProposal {
  proposalType: number;
  quorumNumerator: bigNumber;
  quorumDenominator: bigNumber;
  endTime: bigNumber;
  action: number;
  intParams: bigNumber[];
  addressParams: string[];
  state: any;
  forVotes: OrganizationContractProposalVote[];
  againstVotes: OrganizationContractProposalVote[];
}

export interface OrganizationContract {
  methods: {
    balanceInit: () => bigNumber;
    balanceMultiplier: () => bigNumber;
    balances: (address: string) => bigNumber;
    balanceAddresses: (address: string) => OrganizationContractListLink;
    boardMembers: (address: string) => OrganizationContractListLink;
    boardQuorumNumerator: () => bigNumber;
    boardQuorumDenominator: () => bigNumber;
    boardQuorumHours: () => bigNumber;
    countBoardMembers: () => bigNumber;
    logoUrl: () => string;
    mission: () => string;
    proposals: (index: number) => OrganizationContractProposal;
    proposalsLength: () => bigNumber;
    move: (proposalType: number, action: number, intParams: number[], addressParams: string[]) => bigNumber;
    name: () => string;
    resolveProposal: (proposalId: number) => bigNumber;
    shareholderQuorumNumerator: () => bigNumber;
    shareholderQuorumDenominator: () => bigNumber;
    shareholderQuorumHours: () => bigNumber;
    sendShares: (receiver: string, amount: number) => boolean;
    vote: (proposalId: number, isFor: boolean) => void;
  };
  abi: {}[];
  address: string;
  transactionHash: string;
  contract: any;
  Transfer: (params, callback) => any;
  balanceInit: () => bigNumber;
  balanceMultiplier: () => bigNumber;
  balances: () => bigNumber;
  balanceAddresses: () => OrganizationContractListLink;
  boardMembers: () => OrganizationContractListLink;
  boardQuorumNumerator: () => bigNumber;
  boardQuorumDenominator: () => bigNumber;
  boardQuorumHours: () => bigNumber;
  countBoardMembers: () => bigNumber;
  logoUrl: () => string;
  mission: () => string;
  proposals: () => OrganizationContractProposal;
  proposalsLength: () => bigNumber;
  move: any;
  name: () => string;
  resolveProposal: any;
  sendShares: any;
  sendTransaction: () => any;
  send: (value, txParams) => {};
  shareholderQuorumNumerator: () => bigNumber;
  shareholderQuorumDenominator: () => bigNumber;
  shareholderQuorumHours: () => bigNumber;
  vote: any;
}
