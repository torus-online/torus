import { Component, OnInit } from '@angular/core';

import MetamaskOnboarding from '@metamask/onboarding';

@Component({
  selector: 'torus-install-metamask',
  templateUrl: './install-metamask.component.html',
  styleUrls: ['./install-metamask.component.css']
})
export class InstallMetamaskComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  public getMetamask() {
    const onboarding = new MetamaskOnboarding();
    onboarding.startOnboarding()
  }

}
