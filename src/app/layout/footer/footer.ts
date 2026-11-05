import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { VersionStore } from '../../shared/version-store';

@Component({
  selector: 'amv-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private readonly versionStore = inject(VersionStore);
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly isXSmall = toSignal(
    this.breakpointObserver.observe([Breakpoints.XSmall]).pipe(map((result) => result.matches)),
  );

  protected readonly appVersion = this.versionStore.version;
}
