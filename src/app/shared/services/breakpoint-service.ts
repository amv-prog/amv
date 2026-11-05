import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { inject, Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Service()
export class BreakpointService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isXSmall = toSignal(
    this.breakpointObserver.observe([Breakpoints.XSmall]).pipe(map((result) => result.matches)),
  );

  readonly isSmall = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map((result) => result.matches)),
  );
}
