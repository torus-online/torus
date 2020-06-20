import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';

import { Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';

import MetamaskOnboarding from '@metamask/onboarding';

@Injectable({
  providedIn: 'root'
})
export class MetamaskGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const onboarding = new MetamaskOnboarding();
    const windowAsAny = window as any;
    if (!MetamaskOnboarding.isMetaMaskInstalled()) {
      // user needs to install MetaMask
      return of(this.router.parseUrl('/install-metamask'));
    } else if (windowAsAny.accounts && windowAsAny.accounts.length > 0) {
      onboarding.stopOnboarding()
      return of(true);
    } else {
      return from(windowAsAny.ethereum.enable()).pipe(
        map(() => true),
      );
    }
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.canActivate(next, state);
  }

}
