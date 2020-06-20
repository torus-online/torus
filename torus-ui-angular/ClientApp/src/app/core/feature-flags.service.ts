import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

export type FeatureFlagsModel = { name: string, value: string}[];

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagsService {

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.featureFlags$ = http.get<string>(baseUrl + 'featureflags').pipe(
      map(featureFlagsString => JSON.parse(featureFlagsString)),
      shareReplay(1),
    );
  }

  public featureFlags$: Observable<FeatureFlagsModel>;

  public getIsFlagOn$(flagName: string): Observable<boolean> {
    return this.featureFlags$.pipe(
      map(featureFlags => {
        const flagSetting = featureFlags.find(flag => flag.name.toLowerCase() === flagName.toLowerCase());
        if (flagSetting === null) {
          return false;
        }

        return flagSetting.value === 'on';
      })
    );
  }

}
