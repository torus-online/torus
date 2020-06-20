import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CoreStateService } from '../core/core-state.service';
import { FeatureFlagsService } from '../core/feature-flags.service';
import { OrganizationModel } from '../core/organization.model';

@Component({
  selector: 'torus-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {

  constructor(
    featureFlags: FeatureFlagsService,
    private coreState: CoreStateService,
    private router: Router,
  ) {
    this.isMvp2On$ = featureFlags.getIsFlagOn$('mvp2');
    this.userPubKey$ = this.coreState.userPublicKey$.asObservable();
    this.organization$ = this.coreState.organization$.pipe(map(o => o.model));
    this.orgAddr$ = this.organization$.pipe(
      map(org => org?.contractAddress)
    );
  }

  public isMvp2On$: Observable<boolean>;
  public userPubKey$: Observable<string | null>;
  public organization$: Observable<OrganizationModel>;
  public orgAddr$: Observable<string>;

  logout() {
    this.coreState.userPublicKey$.next(null);
    this.router.navigate(['/'])
  }
}
