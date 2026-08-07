import { Component, signal } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { PillTabs, TabItem } from '@shared/components/pill-tabs/pill-tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';

import { AppButtonComponent, AppBadgeComponent } from '@shared/ui';


@Component({
  selector: 'app-home',
  imports: [MatGridListModule, PillTabs, MatDividerModule, AppButtonComponent, AppBadgeComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  activeTab = signal<string>('specimen');

  tabs: TabItem[] = [
    {
      id: 'specimen',
      label: 'Specimen',
      icon: 'text_fields',
    },
    {
      id: 'about',
      label: 'About',
      icon: 'info',
    },
    {
      id: 'license',
      label: 'License',
      icon: 'description',
    },
    {
      id: 'glyphs',
      label: 'Glyphs & languages',
      icon: 'translate',
    },
  ];
}
