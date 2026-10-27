import { Component, signal } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { PillTabs, TabItem } from '@shared/components/pill-tabs/pill-tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';

import {
  AppButtonComponent,
  AppBadgeComponent,
  AppInputComponent,
  AppOtpInputComponent,
  AppFileUploadComponent,
  AppCardComponent,
  AppSelectComponent,
  AppMultiSelectComponent,
  AppSearchableSelectComponent,
  AppAutocompleteComponent,
  SelectOption,
  App
} from '@shared/ui';

@Component({
  selector: 'app-home',
  imports: [
    MatGridListModule,
    PillTabs,
    MatDividerModule,
    AppButtonComponent,
    AppBadgeComponent,
    AppInputComponent,
    AppOtpInputComponent,
    AppFileUploadComponent,
    AppCardComponent,
    AppSelectComponent,
    AppMultiSelectComponent,
    AppSearchableSelectComponent,
    AppAutocompleteComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  activeTab = signal<string>('buttons');

  tabs: TabItem[] = [
    {
      id: 'buttons',
      label: 'Buttons',
      icon: 'smart_button',
    },
    {
      id: 'inputs',
      label: 'Inputs',
      icon: 'input',
    },
    {
      id: 'badges',
      label: 'Badges',
      icon: 'badge',
    },
    {
      id: 'cards',
      label: 'Cards',
      icon: 'branding_watermark',
    },
    {
      id: 'selects',
      label: 'Selects',
      icon: 'list',
    },
    {
      id: 'files',
      label: 'Archivos',
      icon: 'upload_file',
    },
  ];

  roleOptions: SelectOption[] = [
    { label: 'Administrador', value: 'admin', description: 'Acceso total al sistema', icon: 'shield' },
    { label: 'Editor', value: 'editor', description: 'Edición y publicación de contenido', icon: 'edit' },
    { label: 'Usuario', value: 'user', description: 'Acceso estándar de lectura y consulta', icon: 'person' },
    { label: 'Invitado', value: 'guest', description: 'Acceso restringido temporal', icon: 'visibility' },
  ];

  technologyOptions: SelectOption[] = [
    { label: 'Angular 22', value: 'angular' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Tailwind CSS', value: 'tailwind' },
    { label: 'RxJS', value: 'rxjs' },
    { label: 'Node.js', value: 'nodejs' },
    { label: 'PostgreSQL', value: 'postgres' },
    { label: 'Docker', value: 'docker' },
  ];

  countryOptions: SelectOption[] = [
    { label: 'Argentina', value: 'AR' },
    { label: 'Brasil', value: 'BR' },
    { label: 'Chile', value: 'CL' },
    { label: 'Colombia', value: 'CO' },
    { label: 'España', value: 'ES' },
    { label: 'México', value: 'MX' },
    { label: 'Perú', value: 'PE' },
    { label: 'Estados Unidos', value: 'US' },
  ];
}

