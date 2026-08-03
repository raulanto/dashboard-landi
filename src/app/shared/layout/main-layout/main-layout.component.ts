import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AnalistaSidenavService } from '@shared/services/analista-sidenav.service';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { ShareLinkDialogComponent } from '../../components/share-link-dialog/share-link-dialog.component';
import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { SidenavService } from '../../services/sidenav.service';
import { ShortcutService } from '../../services/shortcut.service';
@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        DashboardLayoutComponent,
        FooterComponent,
        MatSidenavModule,


        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatMenuModule,
        MatTooltipModule,
        MatDividerModule,
        RouterLink,
        RouterLinkActive
    ],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
    private router = inject(Router);
    private dialog = inject(MatDialog);
    public themeService = inject(ThemeService);
    public authService = inject(AuthService);
    public sidenavService = inject(SidenavService);
    public analistaSidenavService = inject(AnalistaSidenavService);

    private shortcutService = inject(ShortcutService);
    user: any;


    constructor() {
        this.shortcutService.onShortcut('q', true)
            .pipe(
                takeUntilDestroyed()
            )
            .subscribe(() => {
                this.router.navigate(['/promotor/create-prospect']);
            });

        this.shortcutService.onShortcut('w', true)
            .pipe(
                takeUntilDestroyed()
            )
            .subscribe(() => {
                this.router.navigate(['/promotor/dashboard']);
            });

        this.shortcutService.onShortcut('e', true)
            .pipe(
                takeUntilDestroyed()
            )
            .subscribe(() => {
                this.router.navigate(['/promotor/home']);
            });

        this.shortcutService.onShortcut('r', true)
            .pipe(
                takeUntilDestroyed()
            )
            .subscribe(() => {
                this.router.navigate(['/promotor/renovacion']);
            });
    }

    get userRoleName(): string {
        switch (this.user.TIPO_US) {
            case 0: return 'Administrador';
            case 3: return 'Promotor';
            case 4: return 'Coordinador';
            case 2: return 'Analista';
            default: return 'Usuario';
        }
    }

    public pageTitle = '';
    private activatedRoute = inject(ActivatedRoute);

    ngOnInit() {


        // Initial title
        this.updateTitle();

        // Update on navigation
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.updateTitle();
        });


    }

    private updateTitle() {
        let route = this.activatedRoute;
        while (route.firstChild) {
            route = route.firstChild;
        }

        route.data.subscribe(data => {
            this.pageTitle = data['breadcrumb'] || 'FinCrece';
        });
    }

    logout() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: { title: '¿Cerrar Sesión?', message: '¿Estás seguro de que quieres salir?' },
            width: '350px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.authService.logout();
                this.router.navigate(['/login']);
            }
        });
    }

    openShareLinkDialog(): void {
        this.dialog.open(ShareLinkDialogComponent, {
            width: '450px',
            maxWidth: '95vw'
        });
    }
}
