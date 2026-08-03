import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then((c) => c.Home),
        title: 'Inicio',
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
