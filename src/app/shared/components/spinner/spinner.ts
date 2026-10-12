import { Component, computed, inject } from '@angular/core';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'amv-spinner',
  imports: [],
  templateUrl: './spinner.html',
})
export class Spinner {
  private readonly loadingService = inject(LoadingService);

  protected readonly isShowing = computed(() => this.loadingService.counter() > 0);
}
