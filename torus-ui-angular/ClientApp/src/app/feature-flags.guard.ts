import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';

import { FeatureFlagsService } from './core/feature-flags.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagsGuard implements CanActivate, CanActivateChild {
  constructor(private featureFlags: FeatureFlagsService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const featureFlagName = next.data['featureFlag'] as string | null;
    if (typeof featureFlagName === 'undefined' || featureFlagName === null) {
      return of(false);
    }

    return this.featureFlags.getIsFlagOn$(featureFlagName);
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.canActivate(next, state);
  }

}
