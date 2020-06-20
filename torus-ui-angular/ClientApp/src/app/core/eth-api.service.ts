import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

export enum TransactionNotification {
  ContractDeployment = 'ContractDeployment',
  SharesSend = 'SharesSend',
}

@Injectable({
  providedIn: 'root'
})
export class EthApiService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  public notifyComplete(transactionHash: string, email: string, notification: TransactionNotification): Observable<any> {
    return this.http.post(
      this.baseUrl + 'eth/notify-complete',
      {
        transactionHash: transactionHash,
        email: email,
        notification: notification,
      });
  }

}
