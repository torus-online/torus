import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable, of } from 'rxjs';
import { flatMap, map, tap } from 'rxjs/operators';

import * as storage from 'local-storage-fallback';
import { StorageConsentDialogComponent } from '../storage-consent-dialog/storage-consent-dialog.component';

export enum StorageKey {
  consent = 'consent',
  contractId = 'contractId',
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(public dialog: MatDialog) { }

  public get(key: StorageKey): string | null {
    return storage.default.getItem(key);
  }

  public set$(key: StorageKey, value: string): Observable<boolean> {
    const getConsent$ = this.get(StorageKey.consent) === 'true'
      ? of(true)
      : of(this.dialog.open(StorageConsentDialogComponent)).pipe(
        flatMap(dialogRef => dialogRef.afterClosed()),
        tap(result => {
          if (result) {
            storage.default.setItem(StorageKey.consent, 'true');
          }
        }),
        map(result => result as boolean)
      );

    return getConsent$.pipe(
      tap(isConsent => {
        if (isConsent) {
          storage.default.setItem(key, value);
        }
      })
    );
  }

  public remove(key: StorageKey): void {
    storage.default.removeItem(key);
  }

  public clear(): void {
    storage.default.clear();
  }

}
