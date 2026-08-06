import { Component } from '@angular/core';
import { PageHeader } from '@shared/components/page-header/page-header';
import { MatGridListModule } from '@angular/material/grid-list';
@Component({
  selector: 'app-home',
  imports: [PageHeader, MatGridListModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
