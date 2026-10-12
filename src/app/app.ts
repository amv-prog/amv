import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './layout/footer/footer';
import { Spinner } from './shared/components/spinner/spinner';

@Component({
  selector: 'amv-root',
  imports: [RouterOutlet, Footer, Spinner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
