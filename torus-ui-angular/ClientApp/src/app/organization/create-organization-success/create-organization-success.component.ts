import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { Observable, from, bindCallback, of, EMPTY, forkJoin } from 'rxjs';
import { flatMap, map, filter, shareReplay, concatMap } from 'rxjs/operators';

import { CoreStateService } from 'src/app/core/core-state.service';
import { OrganizationContract } from 'src/app/core/organization-contract.interface';
import { StorageService, StorageKey } from 'src/app/core/storage.service';
import { OrganizationsService } from 'src/app/core/organizations.service';

@Component({
  selector: 'torus-create-organization-success',
  templateUrl: './create-organization-success.component.html',
  styleUrls: ['./create-organization-success.component.css']
})
export class CreateOrganizationSuccessComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private coreState: CoreStateService,
    private storage: StorageService,
  ) {
    this.contractAddress$ = this.coreState.organizationContractId$.pipe(
      filter(id => typeof id !== 'undefined' && id !== null),
      shareReplay(1),
    );

    this.totalShares$ = this.coreState.organization$.pipe(
      filter(org => typeof org !== 'undefined' && org !== null),
      shareReplay(1),
      map(org => org.model.balanceInit),
    );
  }

  public saveOrgCheckbox = this.fb.control(this.storage.get(StorageKey.consent) === 'true');
  public totalShares$: Observable<number>;
  public contractAddress$: Observable<string>;

  ngOnInit(): void {
    this.saveOrgCheckbox.valueChanges.pipe(
      flatMap(isSave => this.contractAddress$.pipe(map(contractAddress => [isSave, contractAddress] as [boolean, string]))),
      flatMap(([isSave, contractAddress]) => {
        if (isSave) {
          return this.storage.set$(StorageKey.contractId, contractAddress);
        } else {
          return of(this.storage.remove(StorageKey.contractId));
        }
      })
    ).subscribe();
  }

}
