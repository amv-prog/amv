import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, computed, inject } from '@angular/core';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'amv-loader',
  imports: [CdkConnectedOverlay, CdkOverlayOrigin],
  templateUrl: './loader.html',
})
export class Loader {
  private readonly loadingService = inject(LoadingService);

  protected readonly isShowing = computed(() => this.loadingService.counter() > 0);
}
