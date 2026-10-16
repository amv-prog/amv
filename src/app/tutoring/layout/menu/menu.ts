import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SynchronizationInfo } from './synchronization-info/synchronization-info';

@Component({
  selector: 'amv-menu',
  imports: [RouterLink, RouterLinkActive, SynchronizationInfo],
  templateUrl: './menu.html',
})
export class Menu {}
