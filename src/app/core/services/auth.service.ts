import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Using signals for reactive state
  private readonly _currentUser = signal<User | null>(null);
  private readonly _token = signal<string | null>(null);

  // Expose read-only signals
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly token = this._token.asReadonly();

  public readonly isAuthenticated = computed(() => !!this._token());

  constructor() {
    // Check local storage for existing session
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      this._token.set(storedToken);
      this._currentUser.set({ id: '1', email: 'test@example.com', name: 'Test User' });
    }
  }

  login(email: string, password: string): Promise<boolean> {
    // Mocking an API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const fakeToken = 'mock-jwt-token-' + Math.random().toString(36).substring(7);

          this._token.set(fakeToken);
          this._currentUser.set({ id: '1', email, name: 'Test User' });

          localStorage.setItem('auth_token', fakeToken);
          resolve(true);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('auth_token');
  }
}
