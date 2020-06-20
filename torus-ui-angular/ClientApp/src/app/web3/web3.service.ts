import {Injectable, OnDestroy} from '@angular/core';
import {Subject, from, Observable, interval, of, BehaviorSubject, fromEvent} from 'rxjs';
import { map, take, concatMap, tap, flatMap, shareReplay, takeUntil } from 'rxjs/operators';
import { EventEmitter } from 'events';

declare let require: any;
const Web3 = require('web3');
const contract = require('@truffle/contract');

declare let window: any;

@Injectable()
export class Web3Service implements OnDestroy {
  private web3$: Observable<any>;
  private accounts: string[];

  public ready = false;
  public accounts$ = new BehaviorSubject<string[]>([]);

  constructor() {
    this.bootstrapWeb3();
  }

  ngOnDestroy(): void {
  }

  public bootstrapWeb3() {
    console.log('Bootstrapping web3...');
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.ethereum !== 'undefined') {
      console.log('Found web3 injections.');
      // Use Mist/MetaMask's provider
      this.web3$ = from(window.ethereum.enable()).pipe(
        map(() => new Web3(window.ethereum)),
        shareReplay(1),
      );
    } else {
      console.log('No web3? You should consider trying MetaMask!');

      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3$ = of(
        new Web3(
          new Web3.providers.HttpProvider('http://localhost:7545')
        )
      ).pipe(
        shareReplay(1),
      );
    }

    this.refreshAccounts$().subscribe();
  }

  public artifactsToContract$(artifacts): Observable<any> {
    return this.web3$.pipe(
      map(web3 => {
        const contractAbstraction = contract(artifacts);
        contractAbstraction.setProvider(web3.currentProvider);
        return contractAbstraction;
      })
    );
  }

  public newContract$<T>(artifacts: any, senderAddress: string, params: any[]): Observable<Promise<T>> {
    return this.artifactsToContract$(artifacts).pipe(
      map(c => c.new(...params, {from: senderAddress})),
      shareReplay(1),
    );
  }

  public retrieveContract$<T>(artifacts: any, contractAddress: string): Observable<T> {
    return this.artifactsToContract$(artifacts).pipe(
      flatMap(c => from(c.at(contractAddress)).pipe(map(c => c as T))),
    );
  }

  public refreshAccounts$(): Observable<string[]> {
    return this.web3$.pipe(
      flatMap(web3 => from(web3.eth.getAccounts())),
      tap((accs: string[]) => {
        // Get the initial account balance so it can be displayed.
        if (accs.length === 0) {
          console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
          return;
        }

        if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
          console.log('Observed new accounts');

          this.accounts$.next(accs);
          this.accounts = accs;
        }

        this.ready = true;
      })
    );
  }
}
