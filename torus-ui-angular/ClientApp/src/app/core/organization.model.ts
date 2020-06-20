import { ShareholderModel } from './shareholder.model';

export interface OrganizationModel {
  contractAddress: string;
  name: string;
  logoUrl: string;
  mission: string;
  balanceInit: number;
  balanceMultiplier: number;
  boardQuorumNumerator: number;
  boardQuorumDenominator: number;
  boardQuorumHours: number;
  shareholderQuorumNumerator: number;
  shareholderQuorumDenominator: number;
  shareholderQuorumHours: number;
  topShareholders: ShareholderModel[];
  boardMembers: string[];
}
