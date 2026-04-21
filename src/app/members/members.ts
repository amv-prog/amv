import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menu } from './layout/menu/menu';

@Component({
  selector: 'amv-members',
  imports: [RouterOutlet, Menu],
  templateUrl: './members.html',
})
export class Members {}
