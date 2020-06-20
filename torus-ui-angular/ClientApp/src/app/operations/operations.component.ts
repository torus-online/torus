import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'torus-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {

  constructor() {
    this.navLinks = [
      {
        label: 'Codelaws',
        path: './codelaws',
      }, {
        label: 'Policies',
        path: './policies',
      }, {
        label: 'Proposals',
        path: './proposals',
      }, {
        label: 'Roles',
        path: './roles',
      },
    ];
  }

  navLinks: any[];

  ngOnInit(): void {
  }

}
