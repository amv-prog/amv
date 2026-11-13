import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreakpointService } from '../../shared/services/breakpoint-service';
import { VersionStore } from '../../shared/version-store';

@Component({
  selector: 'amv-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private readonly versionStore = inject(VersionStore);
  protected readonly isXSmall = inject(BreakpointService).isXSmall;

  protected readonly appVersion = this.versionStore.version;
}
