import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { EventEmitter } from 'events';

import { EthApiService, TransactionNotification } from 'src/app/core/eth-api.service';

enum SendingDialogState {
  AwaitingUserConfirmation,
  AwaitingTransaction,
}

@Component({
  selector: 'torus-create-organization-sending-dialog',
  templateUrl: './create-organization-sending-dialog.component.html',
  styleUrls: ['./create-organization-sending-dialog.component.css']
})
export class CreateOrganizationSendingDialogComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private ethApi: EthApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.eventEmitter.on('transactionHash', hash => {
      console.log(hash);
      this.transactionHash = hash;
      this.state = SendingDialogState.AwaitingTransaction;
    });
    this.email = this.fb.control(null, [Validators.required, Validators.email]);
  }

  public state: SendingDialogState = SendingDialogState.AwaitingUserConfirmation;
  public sendingDialogState = SendingDialogState;

  public email: FormControl;
  public isNotifyComplete: boolean = false;
  public transactionHash: string = null;
  public eventEmitter = this.data.orgPromise as EventEmitter;

  ngOnInit(): void {
  }

  public notify() {
    this.ethApi.notifyComplete(this.transactionHash, this.email.value, TransactionNotification.ContractDeployment)
      .subscribe(() => {
        this.isNotifyComplete = true;
      })
  }

}
