import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter, map, flatMap, share, shareReplay } from 'rxjs/operators';

import { OrganizationState } from './organization-state';
import { OrganizationsService } from './organizations.service';


@Injectable({
  providedIn: 'root'
})
export class CoreStateService {

  constructor(
    private organizations: OrganizationsService,) { }

  public userPublicKey$ = new BehaviorSubject<string | null>(null);
  public organizationContractId$ = new BehaviorSubject<string | null>(null);
  public organization$ = this.organizationContractId$.pipe(
    filter(id => typeof id !== 'undefined' && id !== null),
    distinctUntilChanged(),
    flatMap(id => this.organizations.getOrganizationContractInstance$(id)),
    shareReplay(1),
    flatMap(contractInstance => this.organizations.getOrganizationModel$(contractInstance).pipe(
      map(orgModel => <OrganizationState>{
        model: orgModel,
        contract: contractInstance,
      })
    )),
  );
}
