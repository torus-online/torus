import { Component, OnInit, Inject, ViewChild, ComponentRef } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable, from, bindCallback, throwError } from 'rxjs';
import { startWith, map, tap, flatMap, catchError } from 'rxjs/operators';

import { Web3Service } from '../web3/web3.service';
import { OrganizationsService } from '../core/organizations.service';
import { CoreStateService } from '../core/core-state.service';
import { OrganizationContract } from '../core/organization-contract.interface';
import { SendingTransactionComponent } from '../sending-transaction/sending-transaction.component';
import { EventEmitter } from 'events';

enum SendSharesDialogComponentState {
  FormInput,
  FormSubmutted,
}

@Component({
  selector: 'torus-send-shares-dialog',
  templateUrl: './send-shares-dialog.component.html',
  styleUrls: ['./send-shares-dialog.component.css']
})
export class SendSharesDialogComponent implements OnInit {

  constructor(
    /* @Inject(MAT_DIALOG_DATA) public data: DialogData, */
    private fb: FormBuilder,
    private coreState: CoreStateService,
    private organizations: OrganizationsService,
    private web3: Web3Service,
    private matSnackBar: MatSnackBar,
    public dialogRef: MatDialogRef<SendSharesDialogComponent>
  ) {
    console.log('Constructor: ' + web3);

    this.form = this.fb.group({
      'sendFrom': [ null, Validators.required ],
      'sendTo': [ null, Validators.required ],
      'amount': [ 1, [ Validators.required, Validators.min(1), Validators.max(this.balance) ] ],
    });

    this.contract$ = this.coreState.organization$.pipe(
      map(state => state.contract),
    );

    this.filteredPublicKeys = this.form.get('sendTo').valueChanges
      .pipe(
        startWith(''),
        map(value => this.filter(value))
      );
  }

  public state: SendSharesDialogComponentState = SendSharesDialogComponentState.FormInput;
  public sendSharesDialogComponentState = SendSharesDialogComponentState;

  public form: FormGroup;

  contract$: Observable<OrganizationContract>;
  accounts: string[];

  public balance = 0;
  public transactionPromise: EventEmitter;

  status = '';

  priorPublicKeys: string[] = ['0x15C339fb3BC1EE5eCf20a5e19aad7BDb10424aDD'];
  filteredPublicKeys: Observable<string[]>;

  ngOnInit(): void {
    console.log('OnInit: ' + this.web3);
    console.log(this);
    this.watchAccount();
    this.contract$.pipe(
      flatMap(contract => bindCallback(contract.Transfer).call(contract, [{}]))
    ).subscribe(() => {
      console.log('Transfer event came in, refreshing balance');
      this.refreshBalance();
    });
  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.priorPublicKeys.filter(pKey => pKey.toLowerCase().includes(filterValue));
  }

  watchAccount() {
    this.web3.accounts$.subscribe(accounts => {
      this.accounts = accounts;
      this.form.get('sendFrom').setValue(accounts[0]);
      this.refreshBalance();
    });
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, {duration: 3000});
  }

  sendShares() {
    this.state = SendSharesDialogComponentState.FormSubmutted;

    const amount = this.form.get('amount').value;
    const receiver = this.form.get('sendTo').value;

    console.log('Sending shares' + amount + ' to ' + receiver);

    this.setStatus('Initiating transaction... (please wait)');
    this.contract$.subscribe(contract => {
      this.transactionPromise =
        this.organizations.sendShares$(contract, this.form.get('sendFrom').value, receiver, amount);
      this.transactionPromise.on('receipt', receipt => {
        this.dialogRef.close();
      });
    });
  }

  refreshBalance(): void {
    console.log('Refreshing balance');

    this.contract$.pipe(
      tap(deployed => console.log(deployed)),
      map(deployed => [deployed, this.form.get('sendFrom').value] as [OrganizationContract, string]),
      flatMap(([deployed, account]) => from(deployed.balances.call(account))),
      catchError(err => {
        console.error(err);
        this.setStatus('Error getting balance; see log.');
        return throwError(err);
      }),
    ).subscribe((sharesBalance: number) => {
      console.log('Found balance: ' + sharesBalance);
      this.balance = sharesBalance;
    });
  }

}
