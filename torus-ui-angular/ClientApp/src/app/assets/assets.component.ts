import { Component, OnInit } from '@angular/core';

import { FeatureFlagsService } from '../core/feature-flags.service';

@Component({
  selector: 'torus-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit {

  constructor(private featureFlags: FeatureFlagsService) {
    this.navLinks = [
      {
        label: 'Shares',
        path: './shares',
      },
    ];
  }

  navLinks: any[];

  ngOnInit(): void {
    this.featureFlags.getIsFlagOn$('mvp2')
      .subscribe(isOn => {
        if (isOn) {
          this.navLinks.push({
            label: 'Treasury',
            path: './treasury',
          });
          this.navLinks.push({
            label: 'Secrets',
            path: './secrets',
          });
        }
      });
  }

}
