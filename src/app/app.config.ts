import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { AUTH_API_PORT } from './core/adapters/auth-api.port';
import { FastApiAuthAdapter } from './core/adapters/fastapi-auth.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideAnimationsAsync(),
    { provide: AUTH_API_PORT, useClass: FastApiAuthAdapter },
  ]
};
