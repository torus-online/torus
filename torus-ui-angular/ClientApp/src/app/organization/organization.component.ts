import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { SendSharesDialogComponent } from '../send-shares-dialog/send-shares-dialog.component';
import { OrganizationModel } from '../core/organization.model';
import { CoreStateService } from '../core/core-state.service';
import { FeatureFlagsService } from '../core/feature-flags.service';

@Component({
  selector: 'torus-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css']
})
export class OrganizationComponent implements OnInit, OnDestroy {

  constructor(
    featureFlags: FeatureFlagsService,
    public dialog: MatDialog,
    private coreState: CoreStateService,
  ) {
    this.isMvp2On$ = featureFlags.getIsFlagOn$('mvp2');
    this.userPubKey$ = this.coreState.userPublicKey$.asObservable();
  }

  public isMvp2On$: Observable<boolean>;
  public userPubKey$: Observable<string | null>;
  public model: OrganizationModel | null = null;

  private modelSubscription: Subscription;

  ngOnInit(): void {
    this.modelSubscription = this.coreState.organization$.pipe(
      map(o => o.model),
      // pull expected image size
      map(om => {
        if (/^https:\/\/www.libravatar.org/i.test(om.logoUrl)) {
          om.logoUrl += '&s=300';
        }
        return om;
      })
    ).subscribe(model => {
      this.model = model;
    });
  }

  ngOnDestroy(): void {
    this.modelSubscription.unsubscribe();
  }

  openSendSharesDialog(event: Event): void {
    const dialogRef = this.dialog.open(SendSharesDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}
