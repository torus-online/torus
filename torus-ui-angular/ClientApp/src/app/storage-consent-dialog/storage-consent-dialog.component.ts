import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'torus-storage-consent-dialog',
  templateUrl: './storage-consent-dialog.component.html',
  styleUrls: ['./storage-consent-dialog.component.css']
})
export class StorageConsentDialogComponent implements OnInit {

  constructor(
    private fb: FormBuilder) { }

  consentCheckbox = this.fb.control(false, Validators.requiredTrue);

  ngOnInit(): void {
  }

}
