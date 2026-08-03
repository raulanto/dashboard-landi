import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  ActivatedRoute,
  NavigationEnd,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';

import { DashboardLayoutComponent } from '@shared/layout/dashboard-layout/dashboard-layout.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';


import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@core/services/auth.service';
import { SidenavService } from '@shared/services/sidenav.service';
import { AnalistaSidenavService } from '@shared/services/analista-sidenav.service';

@Component({
  selector: 'app-feature-dashboard-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    DashboardLayoutComponent,
    FooterComponent,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatSidenavModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  public themeService = inject(ThemeService);
  public authService = inject(AuthService);
  public sidenavService = inject(SidenavService);
  public analistaSidenavService = inject(AnalistaSidenavService);
  user: any;

  get userRoleName(): string {
    if (!this.user) return 'Usuario';
    switch (this.user.TIPO_US) {
      case 0:
        return 'Administrador';
      case 3:
        return 'Promotor';
      case 4:
        return 'Coordinador';
      default:
        return 'Analista';
    }
  }

  public pageTitle = '';
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit() {


    // Initial title
    this.updateTitle();

    // Update on navigation
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateTitle();
    });
  }

  private updateTitle() {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    // Get data from the route
    route.data.subscribe((data) => {
      this.pageTitle = data['breadcrumb'] || 'FinCrece Analista';
    });
  }

  logout() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: '¿Cerrar Sesión?', message: '¿Estás seguro de que quieres salir?' },
      width: '350px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
