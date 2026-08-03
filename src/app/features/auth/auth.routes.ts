import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((c) => c.Login),
        title: 'Iniciar Sesión',
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
];
