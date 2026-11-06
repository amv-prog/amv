import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { computed, inject, Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Service()
export class BreakpointService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  private breakpointState = toSignal(
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ]),
  );

  readonly isXSmall = computed(() => {
    return !!this.breakpointState()?.breakpoints[Breakpoints.XSmall];
  });

  readonly isSmall = computed(() => {
    return !!this.breakpointState()?.breakpoints[Breakpoints.Small];
  });

  readonly isMedium = computed(() => {
    return !!this.breakpointState()?.breakpoints[Breakpoints.Medium];
  });

  readonly isLarge = computed(() => {
    return !!this.breakpointState()?.breakpoints[Breakpoints.Large];
  });

  readonly isMaxSmall = computed(() => {
    return this.isXSmall() || this.isSmall();
  });

  readonly isMaxMedium = computed(() => {
    return this.isMaxSmall() || this.isMedium();
  });

  readonly isMaxLarge = computed(() => {
    return this.isMaxMedium() || this.isLarge();
  });
}
