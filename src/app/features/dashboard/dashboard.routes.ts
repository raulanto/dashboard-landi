import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then((c) => c.Home),
        title: 'Inicio',
    },
    {
        path: 'view-tables',
        loadComponent: () => import('./pages/view-tables/view-tables').then((c) => c.ViewTables),
        title: 'Vizualiador de Tablas',
    },
    {
        path: 'roles',
        loadComponent: () => import('./pages/roles/roles').then((c) => c.RolesPage),
        title: 'Gestión de Roles',
    },
    {
        path: 'permissions',
        loadComponent: () => import('./pages/permissions/permissions').then((c) => c.PermissionsPage),
        title: 'Gestión de Permisos',
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
