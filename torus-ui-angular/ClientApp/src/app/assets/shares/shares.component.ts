import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { Observable, of, Subject } from 'rxjs';

import { ShareholderModel } from '../../core/shareholder.model';
import { SharesDataSource } from './shares-datasource';
import { SendSharesDialogComponent } from '../../send-shares-dialog/send-shares-dialog.component';
import { CoreStateService } from 'src/app/core/core-state.service';
import { OrganizationsService } from 'src/app/core/organizations.service';

@Component({
  selector: 'torus-shares',
  templateUrl: './shares.component.html',
  styleUrls: ['./shares.component.css']
})
export class SharesComponent implements OnInit, AfterViewInit {

  constructor(
    public dialog: MatDialog,
    private organizations: OrganizationsService,
    private coreState: CoreStateService,
  ) {
    this.userPubKey$ = this.coreState.userPublicKey$.asObservable();
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<ShareholderModel>;
  public userPubKey$: Observable<string | null>;
  dataSource: SharesDataSource;
  displayedColumns = ['name', 'shareCount'];

  ngOnInit(): void {
    this.dataSource = new SharesDataSource(this.organizations, this.coreState);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.table.dataSource = this.dataSource;
  }

  openSendSharesDialog(event: Event): void {
    const dialogRef = this.dialog.open(SendSharesDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}
