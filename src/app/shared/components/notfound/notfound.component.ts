import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-notfound',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './notfound.component.html',
    styleUrl: './notfound.component.css'
})
export class NotfoundComponent {
  constructor(private _location: Location) {}

  goBack(): void {
    this._location.back();
  }
}
