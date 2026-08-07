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
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatIconModule } from '@angular/material/icon';

export type InputVariant = 'outlined' | 'filled';
export type InputColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'info'
  | 'error';
export type InputSize = 'xs' | 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'search';

const APP_INPUT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AppInputComponent),
  multi: true,
};

/**
 * Input de texto estilo M3, con esquinas redondeadas tipo pill (igual que
 * AppButtonComponent) y label flotante. Soporta texto normal y multilínea
 * (usando cdkTextareaAutosize para crecer con el contenido).
 *
 * Funciona como ControlValueAccessor -> compatible con formControl/ngModel.
 *
 * Uso:
 *   <app-input label="Correo" type="email" formControlName="email" />
 *   <app-input label="Notas" [multiline]="true" [rows]="3" formControlName="notas" />
 *   <app-input label="Contraseña" type="password" formControlName="password" />
 *   <app-input label="Buscar" prefixIcon="search" [clearable]="true" />
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [MatIconModule, TextFieldModule],
  providers: [APP_INPUT_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-input-host',
    '[class]': 'hostClasses()',
  },
  template: `
    <div class="app-input__field">
      @if (prefixIcon()) {
        <mat-icon class="app-input__icon">{{ prefixIcon() }}</mat-icon>
      }

      @if (multiline()) {
        <textarea
          #nativeInput
          class="app-input__control"
          cdkTextareaAutosize
          [cdkAutosizeMinRows]="rows()"
          [placeholder]="isFloating() ? placeholder() : ''"
          [disabled]="disabled()"
          [attr.maxlength]="maxLength()"
          [attr.required]="required() ? true : null"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
        ></textarea>
      } @else {
        <input
          #nativeInput
          class="app-input__control"
          [type]="effectiveType()"
          [placeholder]="isFloating() ? placeholder() : ''"
          [disabled]="disabled()"
          [attr.maxlength]="maxLength()"
          [attr.required]="required() ? true : null"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
        />
      }

      @if (label(); as l) {
        <label class="app-input__label" [class.app-input__label--floating]="isFloating()">
          {{ l }}{{ required() ? ' *' : '' }}
        </label>
      }

      @if (clearable() && hasValue() && !disabled()) {
        <button
          type="button"
          class="app-input__action"
          aria-label="Limpiar campo"
          (click)="clear()"
        >
          <mat-icon class="app-input__icon">close</mat-icon>
        </button>
      }

      @if (type() === 'password') {
        <button
          type="button"
          class="app-input__action"
          [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          (click)="togglePassword()"
        >
          <mat-icon class="app-input__icon">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      }
    </div>

    @if (errorMessage(); as err) {
      <span class="app-input__helper app-input__helper--error" role="alert">{{ err }}</span>
    } @else if (hint(); as h) {
      <span class="app-input__helper">{{ h }}</span>
    }

    @if (maxLength()) {
      <span class="app-input__counter">{{ value().length }}/{{ maxLength() }}</span>
    }
  `,
  styleUrl: './input.component.scss',
})
export class AppInputComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private focusMonitor = inject(FocusMonitor);

  @ViewChild('nativeInput')
  private nativeInputRef?: ElementRef<HTMLInputElement | HTMLTextAreaElement>;

  label = input<string | null>(null);
  placeholder = input('');
  type = input<InputType>('text');
  multiline = input(false);
  rows = input(1);
  variant = input<InputVariant>('outlined');
  color = input<InputColor>('primary');
  size = input<InputSize>('md');
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  prefixIcon = input<string | null>(null);
  clearable = input(false);
  maxLength = input<number | null>(null);
  required = input(false);

  value = signal('');
  disabled = signal(false);
  focused = signal(false);
  showPassword = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  hasValue = computed(() => this.value().length > 0);
  hasError = computed(() => !!this.errorMessage());
  isFloating = computed(() => this.focused() || this.hasValue());
  effectiveType = computed(() => (this.type() === 'password' && this.showPassword() ? 'text' : this.type()));

  hostClasses = computed(() =>
    [
      `app-input--${this.variant()}`,
      `app-input--${this.size()}`,
      `app-input--${this.hasError() ? 'error' : this.color()}`,
      this.focused() ? 'app-input--focused' : '',
      this.disabled() ? 'app-input--disabled' : '',
      this.multiline() ? 'app-input--multiline' : '',
      this.prefixIcon() ? 'app-input--has-icon' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  ngAfterViewInit(): void {
    if (this.nativeInputRef) {
      // CDK FocusMonitor sobre el <input>/<textarea> real: nos da un estado
      // de foco confiable (incluye foco programático) para animar el label
      // y el borde, en vez de depender solo de (focus)/(blur) del DOM.
      this.focusMonitor.monitor(this.nativeInputRef, false).subscribe((origin) => {
        this.focused.set(origin !== null);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.nativeInputRef) {
      this.focusMonitor.stopMonitoring(this.nativeInputRef);
    }
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  clear(): void {
    this.value.set('');
    this.onChange('');
    this.nativeInputRef?.nativeElement.focus();
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}
