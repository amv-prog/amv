import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'amv-toggle',
  imports: [],
  templateUrl: './toggle.html',
  styleUrl: './toggle.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Toggle),
      multi: true,
    },
  ],
})
export class Toggle implements ControlValueAccessor {
  protected readonly value = signal<'LEFT' | 'RIGHT'>('LEFT');
  protected readonly disabled = signal(false);
  public readonly leftLabel = input<string>();
  public readonly rightLabel = input<string>();

  private onChange: (v: 'LEFT' | 'RIGHT') => void = () => {
    // do nothing by default
  };
  onTouched: () => void = () => {
    // do nothing by default
  };

  writeValue(v: 'LEFT' | 'RIGHT'): void {
    this.value.set(v);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected toggleValueAndPropagateChanges() {
    this.value.update((v) => (v === 'LEFT' ? 'RIGHT' : 'LEFT'));
    // tell Angular the value has changed
    this.onChange(this.value());
  }
}
