import { Component, OnInit } from '@angular/core';
import { Router, ActivationStart } from '@angular/router';

import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { CoreStateService } from './core/core-state.service';
import { FeatureFlagsService } from './core/feature-flags.service';

declare let window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  constructor(
    featureFlags: FeatureFlagsService,
    private router: Router,
    public coreState: CoreStateService,
  ) {
    this.isMvp2On$ = featureFlags.getIsFlagOn$('mvp2');
  }

  public isMvp2On$: Observable<boolean>;

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof ActivationStart),
      filter(() => typeof window.ethereum !== 'undefined'),
      map((event: ActivationStart) => {
        const organizationContractAddress = event.snapshot.paramMap.get('orgAddr') as string;
        console.log('loading org with contract address: '+ organizationContractAddress);
        console.log(event.snapshot);

        if (typeof organizationContractAddress === 'undefined' || organizationContractAddress === null) {
          return null;
        }

        return organizationContractAddress;
      })
    ).subscribe(this.coreState.organizationContractId$);
  }

  title = 'app';
}
