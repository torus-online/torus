import { Injectable } from '@angular/core';

import { of, Observable, from, bindCallback, zip, EMPTY, forkJoin, range, } from 'rxjs';
import { map, tap, expand, distinct, take, filter, flatMap, toArray, shareReplay, concatMap, skip, concatAll, reduce } from 'rxjs/operators';

import { ShareholderModel } from './shareholder.model';
import { OrganizationModel } from './organization.model';
import { Web3Service } from '../web3/web3.service';
import { OrganizationContract, OrganizationContractListLink, bigNumber, OrganizationContractProposal } from './organization-contract.interface';
import { EventEmitter } from 'events';

declare let require: any;
const organization_artifacts = require('../../../build/contracts/Organization.json');

export const zeroAddress = '0x0000000000000000000000000000000000000000';

@Injectable({
  providedIn: 'root'
})
export class OrganizationsService {

  constructor(private web3: Web3Service,) { }

  /**
   * createOrganization
   * @argument organization the organization to use to create a contract.
   */
  public createOrganization(
    senderAddress: string, organization: OrganizationModel, startingShares: number
  ): Observable<Promise<OrganizationContract>> {
    return this.web3.newContract$(
      organization_artifacts,
      senderAddress,
      [
        organization.name,
        organization.logoUrl,
        organization.mission,
        startingShares,
      ]
    );
  }

  /**
   * getOrganization
   * @argument contractAddress the address of the organization's contract on the blockchain.
   */
  public getOrganizationContractInstance$(contractAddress: string): Observable<OrganizationContract> {
    const contractAddrLower = contractAddress.toLowerCase();
    return this.web3.retrieveContract$<OrganizationContract>(organization_artifacts, contractAddrLower);
  }

  /**
   * getOrganization
   * contractInstance the instance of the organization's contract on the blockchain.
   */
  public getOrganizationModel$(
    contractInstance: OrganizationContract
  ): Observable<OrganizationModel> {
    const shareholders$ = this.getOrganizationShareholders$(contractInstance, 3);
    const boardMembers$ = this.getBoardMembers$(contractInstance);

    const boundBalanceInit = bindCallback(contractInstance.balanceInit.call);
    const boundBalanceMultiplier = bindCallback(contractInstance.balanceMultiplier.call);
    const boundName = bindCallback(contractInstance.name.call);
    const boundLogoUrl = bindCallback(contractInstance.logoUrl.call);
    const boundMission = bindCallback(contractInstance.mission.call);
    const boundBoardQuorumNumerator = bindCallback(contractInstance.boardQuorumNumerator.call);
    const boundBoardQuorumDenominator = bindCallback(contractInstance.boardQuorumDenominator.call);
    const boundBoardQuorumHours = bindCallback(contractInstance.boardQuorumHours.call);
    const boundShareholderQuorumNumerator = bindCallback(contractInstance.shareholderQuorumNumerator.call);
    const boundShareholderQuorumDenominator = bindCallback(contractInstance.shareholderQuorumDenominator.call);
    const boundShareholderQuorumHours = bindCallback(contractInstance.shareholderQuorumHours.call);

    const org$ = forkJoin(shareholders$, boardMembers$).pipe(
      map(([shsResult, bms]) => <OrganizationModel>{
        contractAddress: contractInstance.address,
        topShareholders: shsResult.shareholders,
        boardMembers: bms,
      }),
      flatMap(org => zip(
        boundBalanceInit.call(contractInstance.balanceInit).pipe(map(([, balanceInit]: [any, number]) => balanceInit)),
        boundBalanceMultiplier.call(contractInstance.balanceMultiplier).pipe(map(([, balanceMultiplier]: [any, number]) => balanceMultiplier)),
        boundName.call(contractInstance.name).pipe(map(([, name]: [any, string]) => name)),
        boundLogoUrl.call(contractInstance.logoUrl).pipe(
          //enforce https
          map(([, logoUrl]: [any, string]) => /^https:\/\//i.test(logoUrl) ? logoUrl : '')
        ),
        boundMission.call(contractInstance.mission).pipe(map(([, mission]: [any, string]) => mission)),
        boundBoardQuorumNumerator.call(contractInstance.boardQuorumNumerator).pipe(map(([, boardQuorumNumerator]: [any, number]) => boardQuorumNumerator)),
        boundBoardQuorumDenominator.call(contractInstance.boardQuorumDenominator).pipe(map(([, boardQuorumDenominator]: [any, number]) => boardQuorumDenominator)),
        boundBoardQuorumHours.call(contractInstance.boardQuorumHours).pipe(map(([, boardQuorumHours]: [any, number]) => boardQuorumHours)),
        boundShareholderQuorumNumerator.call(contractInstance.shareholderQuorumNumerator).pipe(map(([, shareholderQuorumNumerator]: [any, number]) => shareholderQuorumNumerator)),
        boundShareholderQuorumDenominator.call(contractInstance.shareholderQuorumDenominator).pipe(map(([, shareholderQuorumDenominator]: [any, number]) => shareholderQuorumDenominator)),
        boundShareholderQuorumHours.call(contractInstance.shareholderQuorumHours).pipe(map(([, shareholderQuorumHours]: [any, number]) => shareholderQuorumHours)),
      ).pipe(
        map(([
          balanceInit,
          balanceMultiplier,
          name,
          logoUrl,
          mission,
          boardQuorumNumerator,
          boardQuorumDenominator,
          boardQuorumHours,
          shareholderQuorumNumerator,
          shareholderQuorumDenominator,
          shareholderQuorumHours
        ]: [number, number, string, string, string, number, number, number, number, number, number]) => {
          org.balanceInit = balanceInit;
          org.balanceMultiplier = balanceMultiplier;
          org.name = name;
          org.logoUrl = logoUrl;
          org.mission = mission;
          org.boardQuorumNumerator = boardQuorumNumerator;
          org.boardQuorumDenominator = boardQuorumDenominator;
          org.boardQuorumHours = boardQuorumHours;
          org.shareholderQuorumNumerator = shareholderQuorumNumerator;
          org.shareholderQuorumDenominator = shareholderQuorumDenominator;
          org.shareholderQuorumHours = shareholderQuorumHours;
          return org;
        })
      )),
    );

    return org$;
  }

  /**
   * getOrganizationShareholders
   * @argument contractInstance the instance of the organization's contract on the blockchain.
   * @argument takeNext The number of shareholders to return
   * @argument lastAddress if given, indicates last address in previous page. Otherwise starts at beginning.
   */
  public getOrganizationShareholders$(contractInstance: OrganizationContract, takeNext: number, lastAddress?: string): Observable<GetShareholdersResult> {
    const init = typeof lastAddress === 'undefined' || lastAddress === null
      ? zeroAddress
      : lastAddress;

    return of(new ListLinkAddress(init, { prev: init, next: init })).pipe(
      expand((ba, index) => index === takeNext + 1 || ba.address.toLowerCase() !== init && ba.listLink.next.toLowerCase() === init
        ? EMPTY
        : from(contractInstance.balanceAddresses.call(ba.listLink.next)).pipe(
          map((ll: OrganizationContractListLink) => new ListLinkAddress(ba.listLink.next, ll))
        )
      ),
      skip(2),
      toArray(),
      map(bas => [
        bas,
        bas.map(ba => ba.listLink.next.toLowerCase() === zeroAddress).reduce((b, anyEnd) => b || anyEnd)
      ] as [ListLinkAddress[], boolean]),
      flatMap(([bas, isEnd]) => from(bas).pipe(
        flatMap((ba: ListLinkAddress) => from(contractInstance.balances.call(ba.address)).pipe(
          map((balance: bigNumber) => <ShareholderModel>{
            name: ba.address,
            address: ba.address,
            shareCount: balance.toNumber(),
          }),
        )),
        toArray(),
        map(shareholders => new GetShareholdersResult(shareholders as ShareholderModel[], isEnd)),
      ))
    );
  }

  /**
   * getBoardMembers
   * @argument contractInstance the instance of the organization's contract on the blockchain.
   */
  public getBoardMembers$(contractInstance: OrganizationContract): Observable<string[]> {
    const init = zeroAddress;

    return of(new ListLinkAddress(init, { prev: init, next: init })).pipe(
      expand(lla => lla.address.toLowerCase() !== init && lla.listLink.next.toLowerCase() === init
        ? EMPTY
        : from(contractInstance.boardMembers.call(lla.listLink.next)).pipe(
          map((ll: OrganizationContractListLink) => new ListLinkAddress(lla.listLink.next, ll))
        )
      ),
      skip(2),
      map(lla => lla.address),
      toArray(),
    );
  }

  /**
   * getBoardMemberCount
   * @argument contractInstance the instance of the organization's contract on the blockchain.
   */
  public getBoardMemberCount$(contractInstance: OrganizationContract): Observable<number> {
    return bindCallback(contractInstance.countBoardMembers.call).call(contractInstance.countBoardMembers).pipe(
      map(([, countBN]: [any, bigNumber]) => countBN.toNumber())
    );
  }

  /**
   * sendShares
   * @argument contractInstance the instance of the organization's contract on the blockchain.
   * @argument sender The blockchain address to send shares from.
   * @argument receiver The blockchain address to send shares to.
   * @argument amount The number of shares to send.
   */
  public sendShares$(
    contractInstance: OrganizationContract,
    sender: string,
    receiver: string,
    amount: number
  ): Promise<any> & EventEmitter {
    return contractInstance.sendShares.sendTransaction(receiver, amount, {from: sender});
  }

  /**
   * move
   * @argument contractInstance the instance of the organization's contract on the blockchain.
   * @argument caller The blockchain address to send shares from.
   * @argument action The blockchain address to send shares to.
   * @argument intParams The number of shares to send.
   * @argument addressParams The number of shares to send.
   */
  public move$(
    contractInstance: OrganizationContract,
    caller: string,
    action: OrganizationProposalAction,
    intParams: number[],
    addressParams: string[]
  ): Promise<any> & EventEmitter {
    return contractInstance.move.sendTransaction(action, intParams, addressParams, {from: caller});
  }

  /**
   * vote
   * @argument contractInstance the instance of the organization's contract on the blockchain.
   * @argument caller The blockchain address to send shares from.
   * @argument proposalId The blockchain address to send shares to.
   * @argument isFor The number of shares to send.
   */
  public vote$(
    contractInstance: OrganizationContract,
    caller: string,
    proposalId: number,
    isFor: boolean,
  ): Promise<any> & EventEmitter {
    return contractInstance.vote.sendTransaction(proposalId, isFor, {from: caller});
  }

  /**
   * getProposals
   * @argument contractInstance the instance of the organization's contract on the blockchain.
   */
  public getProposals$(
    contractInstance: OrganizationContract,
  ): Observable<OrganizationContractProposal[]> {
    return bindCallback(contractInstance.proposalsLength.call).call(contractInstance.proposalsLength).pipe(
      flatMap((proposalsLength: bigNumber) => range(0, proposalsLength.toNumber() - 1)),
      flatMap((proposalIndex: number) => bindCallback(contractInstance.proposals.call).call(contractInstance.proposals, [ proposalIndex ])),
      reduce(
        (acc, value: OrganizationContractProposal) => { acc.push(value); return acc; },
        [] as OrganizationContractProposal[]
      )
    );
  }

  /**
   * resolveProposal
   * @argument contractInstance the instance of the organization's contract on the blockchain.
   * @argument caller The blockchain address to send shares from.
   * @argument proposalId The blockchain address to send shares to.
   */
  public resolveProposal$(
    contractInstance: OrganizationContract,
    caller: string,
    proposalId: number,
  ): Promise<any> & EventEmitter {
    return contractInstance.resolveProposal.sendTransaction(proposalId, {from: caller});
  }

}

export const enum OrganizationProposalType {
  Shareholder = 0,
  Board = 1,
}

export const enum OrganizationProposalState {
  Open = 0,
  EndedPassed = 1,
  EndedLost = 2,
}

export const enum OrganizationProposalAction {
  ChangeShareholderQuorum = 0,
  ChangeBoardQuorum = 1,
  ChangeShareholderQuorumHours = 2,
  ChangeBoardQuorumHours = 3,
  AddBoardMember = 4,
  RemoveBoardMember = 5,
}

class ListLinkAddress {
  constructor(public address: string, public listLink: OrganizationContractListLink) { }
}

class GetShareholdersResult {
  constructor(public shareholders: ShareholderModel[], public isEndOfData: boolean) { }
}
