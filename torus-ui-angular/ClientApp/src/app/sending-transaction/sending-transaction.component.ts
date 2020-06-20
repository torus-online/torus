import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';

import { EthApiService, TransactionNotification } from '../core/eth-api.service';
import { EventEmitter } from 'events';

enum SendingTransactionComponentState {
  AwaitingUserConfirmation,
  AwaitingTransaction,
}

@Component({
  selector: 'torus-sending-transaction',
  templateUrl: './sending-transaction.component.html',
  styleUrls: ['./sending-transaction.component.css']
})
export class SendingTransactionComponent implements OnInit, OnChanges {

  constructor(
    private fb: FormBuilder,
    private ethApi: EthApiService,
  ) {
    this.email = this.fb.control(null, [Validators.required, Validators.email]);
  }

  @Input() transactionPromise: EventEmitter;

  public state: SendingTransactionComponentState = SendingTransactionComponentState.AwaitingUserConfirmation;
  public sendingTransactionComponentState = SendingTransactionComponentState;

  public email: FormControl;
  public isNotifyComplete: boolean = false;
  public transactionHash: string = null;

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.transactionPromise) {
      this.transactionPromise.on('transactionHash', hash => {
        console.log(hash);
        this.transactionHash = hash;
        this.state = SendingTransactionComponentState.AwaitingTransaction;
      });
    }
  }

  public notify() {
    this.ethApi.notifyComplete(this.transactionHash, this.email.value, TransactionNotification.SharesSend)
      .subscribe(() => {
        this.isNotifyComplete = true;
      })
  }

}
