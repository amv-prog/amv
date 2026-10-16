import { Service, signal } from '@angular/core';

@Service()
export class LoadingService {
  counter = signal<number>(0);

  loadingStart() {
    this.counter.update((nb) => nb + 1);
  }

  loadingStop() {
    this.counter.update((nb) => nb - 1);
  }
}
