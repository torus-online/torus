import { Component, OnInit, Inject, ViewChild, ComponentRef } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable, from, bindCallback, throwError } from 'rxjs';
import { startWith, map, tap, flatMap, catchError } from 'rxjs/operators';

import { Web3Service } from '../../../web3/web3.service';
import { OrganizationsService, OrganizationProposalType, OrganizationProposalAction } from '../../../core/organizations.service';
import { CoreStateService } from '../../../core/core-state.service';
import { OrganizationContract } from '../../../core/organization-contract.interface';
import { EventEmitter } from 'events';

enum SendSharesDialogComponentState {
  FormInput,
  FormSubmutted,
}

@Component({
  selector: 'torus-move-dialog',
  templateUrl: './move-dialog.component.html',
  styleUrls: ['./move-dialog.component.css']
})
export class MoveDialogComponent implements OnInit {

  constructor(
    /* @Inject(MAT_DIALOG_DATA) public data: DialogData, */
    private fb: FormBuilder,
    private coreState: CoreStateService,
    private organizations: OrganizationsService,
    private web3: Web3Service,
    private matSnackBar: MatSnackBar,
    public dialogRef: MatDialogRef<MoveDialogComponent>
  ) {
    console.log('Constructor: ' + web3);

    this.form = this.fb.group({
      'action': [ OrganizationProposalAction.AddBoardMember, Validators.required ],
      'pubKey': [ null, Validators.required ],
      'from': [ null, Validators.required ],
    });

    this.contract$ = this.coreState.organization$.pipe(
      map(state => state.contract),
    );

    this.currentBoardMembers$ = this.contract$.pipe(
      flatMap(contract => this.organizations.getBoardMembers$(contract))
    );

    this.filteredPublicKeys = this.form.get('pubKey').valueChanges
      .pipe(
        startWith(''),
        map(value => this.filter(value))
      );
  }

  public state: SendSharesDialogComponentState = SendSharesDialogComponentState.FormInput;
  public sendSharesDialogComponentState = SendSharesDialogComponentState;

  public form: FormGroup;
  public organizationProposalAction = {
    addBoardMember: OrganizationProposalAction.AddBoardMember,
    removeBoardMember: OrganizationProposalAction.RemoveBoardMember,
    changeBoardQuorum: OrganizationProposalAction.ChangeBoardQuorum,
    changeBoardQuorumHours: OrganizationProposalAction.ChangeBoardQuorumHours,
    changeShareholderQuorum: OrganizationProposalAction.ChangeShareholderQuorum,
    changeShareholderQuorumHours: OrganizationProposalAction.ChangeShareholderQuorumHours,
  };
  public proposalActions = [
    { label: "Add board member", value: OrganizationProposalAction.AddBoardMember },
    { label: "Remove board member", value: OrganizationProposalAction.RemoveBoardMember },
    // { label: "Change board quorum", value: OrganizationProposalAction.ChangeBoardQuorum },
    // { label: "Change board vote deadline", value: OrganizationProposalAction.ChangeBoardQuorumHours },
    // { label: "Change shareholder quorum", value: OrganizationProposalAction.ChangeShareholderQuorum },
    // { label: "Change shareholder vote deadline", value: OrganizationProposalAction.ChangeShareholderQuorumHours },
  ];

  contract$: Observable<OrganizationContract>;
  accounts: string[];

  public transactionPromise: EventEmitter;

  status = '';

  public currentBoardMembers$: Observable<string[]>;
  priorPublicKeys: string[] = ['0x15C339fb3BC1EE5eCf20a5e19aad7BDb10424aDD'];
  filteredPublicKeys: Observable<string[]>;

  public get proposalAction(): number {
    return this.form.get('action').value;
  }

  ngOnInit(): void {
    console.log('OnInit: ' + this.web3);
    console.log(this);
    this.watchAccount();
  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.priorPublicKeys.filter(pKey => pKey.toLowerCase().includes(filterValue));
  }

  watchAccount() {
    this.web3.accounts$.subscribe(accounts => {
      this.accounts = accounts;
      this.form.get('from').setValue(accounts[0]);
    });
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, {duration: 3000});
  }

  propose() {
    this.state = SendSharesDialogComponentState.FormSubmutted;

    const action = this.form.get('action').value as OrganizationProposalAction;
    const caller = this.form.get('from').value as string;
    const intParams = [] as number[];
    const addressParams = [ this.form.get('pubKey').value as string ];

    this.setStatus('Initiating transaction... (please wait)');
    this.contract$.subscribe(contract => {
      this.transactionPromise =
        this.organizations.move$(contract, caller, action, intParams, addressParams);
      this.transactionPromise.on('receipt', receipt => {
        this.dialogRef.close();
      });
    });
  }

}
