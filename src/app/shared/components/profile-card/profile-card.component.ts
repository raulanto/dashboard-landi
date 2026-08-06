import { Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from '@core/services/auth.service';
import { SidenavService } from '@shared/services/sidenav.service';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatIconModule, MatDialogModule, MatButtonModule, MatTooltipModule],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.css'
})
export class ProfileCardComponent {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  public sidenavService = inject(SidenavService);

  // User input using signals
  user = input<any>();

  userRoleName = computed(() => {
    const u = this.user();
    if (!u) return 'Usuario';
    switch (u.TIPO_US) {
      case 0: return 'Administrador';
      case 3: return 'Promotor';
      case 4: return 'Coordinador';
      default: return 'Analista';
    }
  });

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
