import { Component, signal } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { PillTabs, TabItem } from '@shared/components/pill-tabs/pill-tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';

import { AppButtonComponent, AppBadgeComponent, AppInputComponent, AppCardComponent, AppSelectComponent } from '@shared/ui';


@Component({
  selector: 'app-home',
  imports: [MatGridListModule, PillTabs, MatDividerModule, AppButtonComponent, AppBadgeComponent, AppInputComponent, AppCardComponent, AppSelectComponent],
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
  ];
}
