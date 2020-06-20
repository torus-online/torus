import { Component } from '@angular/core';

import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { FeatureFlagsService } from '../core/feature-flags.service';
import { CoreStateService } from '../core/core-state.service';

@Component({
  selector: 'torus-bottom-nav-menu',
  templateUrl: './bottom-nav-menu.component.html',
  styleUrls: ['./bottom-nav-menu.component.css']
})
export class BottomNavMenuComponent {

  constructor(
    coreState: CoreStateService,
    featureFlags: FeatureFlagsService,
  ) {
    this.isMvp2On$ = featureFlags.getIsFlagOn$('mvp2');
    this.orgAddr$ = coreState.organizationContractId$.asObservable();
  }

  public isMvp2On$: Observable<boolean>;
  public orgAddr$: Observable<string>;

}
