import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { flatMap, share, filter, map } from 'rxjs/operators';

import { OrganizationsService, OrganizationProposalState } from '../../core/organizations.service';
import { CoreStateService } from '../../core/core-state.service';
import { OrganizationContractProposal } from 'src/app/core/organization-contract.interface';
import { MoveDialogComponent } from './move-dialog/move-dialog.component';

@Component({
  selector: 'torus-proposals',
  templateUrl: './proposals.component.html',
  styleUrls: ['./proposals.component.css']
})
export class ProposalsComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private organizations: OrganizationsService,
    private coreState: CoreStateService,
  ) {
    this.userPubKey$ = this.coreState.userPublicKey$.asObservable();
    const proposals$ = this.coreState.organization$.pipe(
      share(),
      flatMap(org => this.organizations.getProposals$(org.contract)),
    );
    this.openProposals$ = proposals$.pipe(
      map(ps => ps.filter(p => p.state === OrganizationProposalState.Open))
    );
    this.closedProposals$ = proposals$.pipe(
      map(ps => ps.filter(p => p.state !== OrganizationProposalState.Open))
    );
  }

  public userPubKey$: Observable<string | null>;
  public openProposals$: Observable<OrganizationContractProposal[]>;
  public closedProposals$: Observable<OrganizationContractProposal[]>;

  ngOnInit(): void {
  }

  public openMoveDialog(): void {
    const dialogRef = this.dialog.open(MoveDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      // add new proposal to list
      console.log('The dialog was closed');
    });
  }

}
