import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OrganizationComponent } from './organization/organization.component';
import { OperationsComponent } from './operations/operations.component';
import { AssetsComponent } from './assets/assets.component';
import { CodelawsComponent } from './operations/codelaws/codelaws.component';
import { PoliciesComponent } from './operations/policies/policies.component';
import { ProposalsComponent } from './operations/proposals/proposals.component';
import { RolesComponent } from './operations/roles/roles.component';
import { SharesComponent } from './assets/shares/shares.component';
import { TreasuryComponent } from './assets/treasury/treasury.component';
import { SecretsComponent } from './assets/secrets/secrets.component';
import { SendSharesDialogComponent } from './send-shares-dialog/send-shares-dialog.component';
import { LoginComponent } from './login/login.component';
import { CreateOrganizationComponent } from './organization/create-organization/create-organization.component';
import { CreateOrganizationSuccessComponent } from './organization/create-organization-success/create-organization-success.component';
import { BottomNavMenuComponent } from './bottom-nav-menu/bottom-nav-menu.component';
import { Web3Module } from './web3/web3.module';
import { CreateOrganizationSendingDialogComponent } from './organization/create-organization-sending-dialog/create-organization-sending-dialog.component';
import { MetamaskGuard } from './metamask.guard';
import { InstallMetamaskComponent } from './install-metamask/install-metamask.component';
import { SendingTransactionComponent } from './sending-transaction/sending-transaction.component';
import { StorageConsentDialogComponent } from './storage-consent-dialog/storage-consent-dialog.component';
import { MoveDialogComponent } from './operations/proposals/move-dialog/move-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    OrganizationComponent,
    OperationsComponent,
    AssetsComponent,
    CodelawsComponent,
    PoliciesComponent,
    ProposalsComponent,
    RolesComponent,
    SharesComponent,
    TreasuryComponent,
    SecretsComponent,
    SendSharesDialogComponent,
    LoginComponent,
    CreateOrganizationComponent,
    CreateOrganizationSuccessComponent,
    BottomNavMenuComponent,
    CreateOrganizationSendingDialogComponent,
    InstallMetamaskComponent,
    SendingTransactionComponent,
    StorageConsentDialogComponent,
    MoveDialogComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: LoginComponent, pathMatch: 'full', canActivate: [MetamaskGuard], },
      { path: 'install-metamask', component: InstallMetamaskComponent },
      { path: 'create', component: CreateOrganizationComponent, canActivate: [MetamaskGuard], },
      { path: ':orgAddr', component: OrganizationComponent, canActivate: [MetamaskGuard], },
      { path: ':orgAddr/create-success', component: CreateOrganizationSuccessComponent, canActivate: [MetamaskGuard], },
      { path: ':orgAddr/operations',
        component: OperationsComponent,
        data: { featureFlag: 'mvp2' },
        canActivate: [MetamaskGuard],
        canActivateChild: [MetamaskGuard],
        children: [
          { path: '', redirectTo: 'codelaws', pathMatch: 'full' },
          { path: 'codelaws', component: CodelawsComponent },
          { path: 'policies', component: PoliciesComponent },
          { path: 'proposals', component: ProposalsComponent },
          { path: 'roles', component: RolesComponent },
        ]
      },
      { path: ':orgAddr/assets',
        component: AssetsComponent,
        data: { featureFlag: 'mvp2' },
        canActivate: [MetamaskGuard],
        canActivateChild: [MetamaskGuard],
        children: [
          { path: '', redirectTo: 'shares', pathMatch: 'full' },
          { path: 'shares', component: SharesComponent },
          { path: 'treasury', component: TreasuryComponent },
          { path: 'secrets', component: SecretsComponent },
        ]
      },
    ]),
    BrowserAnimationsModule,
    Web3Module,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSliderModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatToolbarModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatDividerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
