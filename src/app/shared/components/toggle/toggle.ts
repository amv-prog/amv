import { Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'amv-toggle',
  imports: [],
  templateUrl: './toggle.html',
  styleUrl: './toggle.scss',
})
export class Toggle implements FormValueControl<'LEFT' | 'RIGHT'> {
  readonly value = model.required<'LEFT' | 'RIGHT'>();
  public readonly leftLabel = input<string>();
  public readonly rightLabel = input<string>();

  protected toggleValue() {
    this.value.update((v) => (v === 'LEFT' ? 'RIGHT' : 'LEFT'));
  }
}
