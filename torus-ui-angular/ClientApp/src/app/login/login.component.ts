import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router';

import { EMPTY, fromEvent } from 'rxjs';
import { flatMap, map, startWith } from 'rxjs/operators';

import { CoreStateService } from '../core/core-state.service';
import { Web3Service } from '../web3/web3.service';
import { StorageService, StorageKey } from '../core/storage.service';
import { BreakpointObserver, Breakpoints, MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'torus-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private coreState: CoreStateService,
    private storage: StorageService,
    private web3: Web3Service,
    private mediaMatcher: MediaMatcher,
    private router: Router,
  ) {
    const orgAddr = this.storage.get(StorageKey.contractId);
    const saveOrgAddr = orgAddr !== null;

    this.form = this.fb.group({
      'orgAddr': [ orgAddr, Validators.required ],
      'saveOrgAddr': [ saveOrgAddr ],
      'publicKey': [ null, Validators.required ],
    });
  }

  public form: FormGroup;
  public accounts$ = this.web3.accounts$.asObservable();
  public dividerIsVertical$ = fromEvent(
    this.mediaMatcher.matchMedia('(min-width: 840px)'), 'change', {}
  ).pipe(
    startWith(this.mediaMatcher.matchMedia('(min-width: 840px)')),
    map((ev: MediaQueryListEvent) => ev.matches)
  );

  ngOnInit(): void {
    this.form.get('saveOrgAddr').valueChanges.pipe(
      flatMap(isSave => {
        if (isSave) {
          return this.storage.set$(StorageKey.contractId, this.form.get('orgAddr').value);
        } else {
          this.storage.remove(StorageKey.contractId);
          return EMPTY;
        }
      })
    ).subscribe();
  }

  onFormSubmit() {
    if (this.form.valid) {
      // TODO: check to make sure the wallet owns some shares in the
      // specified organization as a weak form of authentication

      const orgAddr = this.form.get('orgAddr').value as string;
      const pubKey = this.form.get('publicKey').value as string;

      if (this.form.get('saveOrgAddr').value) {
        this.storage.set$(StorageKey.contractId, this.form.get('orgAddr').value).subscribe();
      }

      this.coreState.userPublicKey$.next(pubKey);

      this.router.navigate(['/' + orgAddr])
    }
  }

}
