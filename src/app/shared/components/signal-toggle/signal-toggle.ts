import { Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'amv-signal-toggle',
  imports: [],
  templateUrl: './signal-toggle.html',
  styleUrl: './signal-toggle.scss',
})
export class SignalToggle implements FormValueControl<'LEFT' | 'RIGHT'> {
  readonly value = model.required<'LEFT' | 'RIGHT'>();
  public readonly leftLabel = input<string>();
  public readonly rightLabel = input<string>();

  protected toggleValue() {
    this.value.update((v) => (v === 'LEFT' ? 'RIGHT' : 'LEFT'));
  }
}
