import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './layout/footer/footer';
import { Loader } from './shared/components/loader/loader';

@Component({
  selector: 'amv-root',
  imports: [RouterOutlet, Footer, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
