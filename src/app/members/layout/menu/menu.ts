import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'amv-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
})
export class Menu {}
