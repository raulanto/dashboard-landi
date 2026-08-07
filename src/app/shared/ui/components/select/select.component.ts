import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  input,
  signal,
  computed,
  forwardRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusMonitor } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatIconModule } from '@angular/material/icon';

export type SelectVariant = 'outlined' | 'filled';
export type SelectColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'info'
  | 'error';
export type SelectSize = 'xs' | 'sm' | 'md' | 'lg';

export interface SelectOption {
  label: string;
  value: any;
}

const APP_SELECT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AppSelectComponent),
  multi: true,
};

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [MatIconModule, OverlayModule],
  providers: [APP_SELECT_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-select-host',
    '[class]': 'hostClasses()',
  },
  template: `
    <div
      class="app-select__field"
      cdkOverlayOrigin
      #trigger="cdkOverlayOrigin"
      (click)="toggleOpen()"
      [attr.tabindex]="disabled() ? -1 : 0"
      (keydown.enter)="toggleOpen()"
      (keydown.space)="toggleOpen(); $event.preventDefault()"
      (keydown.arrowDown)="open(); $event.preventDefault()"
      (keydown.arrowUp)="open(); $event.preventDefault()"
      #field
    >
      @if (prefixIcon()) {
        <mat-icon class="app-select__icon">{{ prefixIcon() }}</mat-icon>
      }

      <div class="app-select__control">
        @if (!hasValue()) {
          <span class="app-select__placeholder">{{ placeholder() }}</span>
        } @else {
          <span class="app-select__value">{{ displayValue() }}</span>
        }
      </div>

      <mat-icon class="app-select__dropdown-icon" [class.app-select__dropdown-icon--open]="isOpen()">expand_more</mat-icon>

      @if (label(); as l) {
        <label class="app-select__label" [class.app-select__label--floating]="isFloating()">
          {{ l }}{{ required() ? ' *' : '' }}
        </label>
      }
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="isOpen()"
      [cdkConnectedOverlayWidth]="triggerWidth()"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="close()"
      (detach)="close()"
    >
      <div class="app-select__dropdown">
        @for (option of options(); track option.value) {
          <div
            class="app-select__option"
            [class.app-select__option--selected]="option.value === value()"
            (click)="selectOption(option)"
          >
            {{ option.label }}
          </div>
        }
      </div>
    </ng-template>

    @if (errorMessage(); as err) {
      <span class="app-select__helper app-select__helper--error" role="alert">{{ err }}</span>
    } @else if (hint(); as h) {
      <span class="app-select__helper">{{ h }}</span>
    }
  `,
  styleUrl: './select.component.scss',
})
export class AppSelectComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private focusMonitor = inject(FocusMonitor);

  @ViewChild('field')
  private fieldRef?: ElementRef<HTMLDivElement>;

  label = input<string | null>(null);
  placeholder = input('');
  options = input<SelectOption[]>([]);
  variant = input<SelectVariant>('outlined');
  color = input<SelectColor>('primary');
  size = input<SelectSize>('md');
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  prefixIcon = input<string | null>(null);
  required = input(false);

  value = signal<any>('');
  disabled = signal(false);
  focused = signal(false);
  isOpen = signal(false);
  triggerWidth = signal<number | string>('100%');

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  hasValue = computed(() => this.value() !== '' && this.value() !== null && this.value() !== undefined);
  hasError = computed(() => !!this.errorMessage());
  isFloating = computed(() => this.focused() || this.hasValue() || !!this.placeholder());
  
  hasPrefixIcon = computed(() => !!this.prefixIcon());

  displayValue = computed(() => {
    const val = this.value();
    const option = this.options().find(o => o.value === val);
    return option ? option.label : '';
  });

  hostClasses = computed(() =>
    [
      `app-select--${this.variant()}`,
      `app-select--${this.size()}`,
      `app-select--${this.hasError() ? 'error' : this.color()}`,
      this.focused() ? 'app-select--focused' : '',
      this.isOpen() ? 'app-select--open' : '',
      this.disabled() ? 'app-select--disabled' : '',
      this.hasPrefixIcon() ? 'app-select--has-icon' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  ngAfterViewInit(): void {
    if (this.fieldRef) {
      this.focusMonitor.monitor(this.fieldRef, true).subscribe((origin) => {
        this.focused.set(origin !== null || this.isOpen());
        if (origin === null && !this.isOpen()) {
          this.onBlur();
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.fieldRef) {
      this.focusMonitor.stopMonitoring(this.fieldRef);
    }
  }

  writeValue(value: any): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  toggleOpen(): void {
    if (this.disabled()) return;
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.disabled()) return;
    if (this.fieldRef) {
      this.triggerWidth.set(this.fieldRef.nativeElement.getBoundingClientRect().width);
    }
    this.isOpen.set(true);
    this.focused.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.onTouched();
    if (this.fieldRef) {
        this.fieldRef.nativeElement.focus();
    }
  }

  selectOption(option: SelectOption): void {
    this.value.set(option.value);
    this.onChange(option.value);
    this.close();
  }

  onBlur(): void {
    this.onTouched();
  }
}
