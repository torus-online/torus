import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { fromEvent, Observable, Subject, pipe, from } from 'rxjs';
import { takeUntil, filter, auditTime, map, flatMap, shareReplay, tap } from 'rxjs/operators';

import {Md5} from 'ts-md5/dist/md5';

import { CoreStateService } from 'src/app/core/core-state.service';
import { OrganizationModel } from 'src/app/core/organization.model';
import { OrganizationsService } from 'src/app/core/organizations.service';
import { Web3Service } from 'src/app/web3/web3.service';
import { CreateOrganizationSendingDialogComponent } from '../create-organization-sending-dialog/create-organization-sending-dialog.component';
import { OrganizationContract } from 'src/app/core/organization-contract.interface';

@Component({
  selector: 'torus-create-organization',
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.css']
})
export class CreateOrganizationComponent implements OnInit, AfterViewInit {

  constructor(
    private fb: FormBuilder,
    private coreState: CoreStateService,
    private organizations: OrganizationsService,
    private web3: Web3Service,
    private router: Router,
    public dialog: MatDialog,
  ) {
    this.form = this.fb.group({
      'basic': this.fb.group({
        'name': [ null, Validators.required ],
        'mission': [ null, Validators.required ],
      }),
      'logo': this.fb.group({
        'logoUrl': [ null, [ Validators.required, Validators.pattern(/^https:\/\//i) ] ],
      }),
      'shares': this.fb.group({
        'sharesBase': [ 100, [ Validators.required, Validators.min(1) ] ],
        'sharesMultiplier' : [ '1', Validators.pattern(/1|10|1000/) ],
      }),
      'auth': this.fb.group({
        'walletAddress': [ null, Validators.required ],
      }),
      'formArray': this.fb.array([]),
    });
  }

  @ViewChild('logoUrl') logoUrlInput: ElementRef<HTMLInputElement>;
  public form: FormGroup;
  public accounts$ = this.web3.accounts$.asObservable();
  public logoUrl$ = new Subject<string>();
  private organization: OrganizationModel;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const logoUrlControl = this.form.get('logo.logoUrl');

    // automatically generate a logo URL based on org name
    const logoUrlInteraction = fromEvent(this.logoUrlInput.nativeElement, 'keypress');
    this.form.get('basic.name').valueChanges.pipe(
      takeUntil(logoUrlInteraction),
      filter(name => name !== null),
    ).subscribe((name: string) => {
      const nameHash = Md5.hashStr(name.toLowerCase().trim());
      logoUrlControl.setValue(`https://www.libravatar.org/avatar/${nameHash}?d=retro`);
    })

    // automatically load logo preview based on logo URL
    logoUrlControl.valueChanges.pipe(
      filter(lUrl => typeof lUrl !== 'undefined' && lUrl !== null),
      auditTime(3000),
      map(lUrl => {
        if (/^https:\/\/www.libravatar.org/i.test(lUrl)) {
          return lUrl + '&s=80';
        }
        return lUrl;
      })
    ).subscribe(this.logoUrl$);
  }

  onFormSubmit() {
    this.prepareSaveOrganization();
    const startingShares: number = this.form.get('shares.sharesBase').value * this.form.get('shares.sharesMultiplier').value;
    const walletAddress = this.form.get('auth.walletAddress').value;

    this.organizations.createOrganization(
      walletAddress,
      this.organization,
      startingShares
    ).pipe(
      map(orgPromise => {
        const dialogRef = this.dialog.open(CreateOrganizationSendingDialogComponent, {
          data: {
            orgPromise: orgPromise,
          },
          closeOnNavigation: true,
        });

        return [orgPromise, dialogRef] as [Promise<OrganizationContract>, MatDialogRef<CreateOrganizationSendingDialogComponent, any>];
      }),
      flatMap(([orgPromise, dialogRef]) => from(orgPromise).pipe(
        map(contract => [contract, dialogRef] as [OrganizationContract, MatDialogRef<CreateOrganizationSendingDialogComponent, any>])
      )),
    ).subscribe(([contract, dialogRef]) => {
      this.organization.contractAddress = contract.address;

      dialogRef.close();

      this.coreState.userPublicKey$.next(walletAddress);
      this.router.navigate([`/${this.organization.contractAddress}/create-success`]);
    });
  }

  clearUrl(event: Event): boolean {
    this.logoUrlInput.nativeElement.value = '';

    event.preventDefault();
    return false;
  }

  prepareSaveOrganization() {
    const walletAddress = this.form.get('auth.walletAddress').value;
    this.organization = {
      contractAddress: null,
      name: this.form.get('basic.name').value,
      logoUrl: this.form.get('logo.logoUrl').value,
      mission: this.form.get('basic.mission').value,
      balanceInit: Number(this.form.get('shares.sharesBase').value) * Number(this.form.get('shares.sharesMultiplier').value),
      balanceMultiplier: 1,
      boardQuorumNumerator: 0,
      boardQuorumDenominator: 0,
      boardQuorumHours: 0,
      shareholderQuorumNumerator: 0,
      shareholderQuorumDenominator: 0,
      shareholderQuorumHours: 0,
      topShareholders: [
        {
          name: walletAddress,
          address: walletAddress,
          shareCount: Number(this.form.get('shares.sharesBase').value) * Number(this.form.get('shares.sharesMultiplier').value),
        },
      ],
      boardMembers: [ walletAddress ],
    };
  }

}
