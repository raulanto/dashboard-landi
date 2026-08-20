import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { AuthApiPort } from './auth-api.port';
import { User } from '../models/user.model';
import { UserCreateDto, UserReadDto } from '../models/auth-api.models';

const FORM_URL_ENCODED_HEADERS = { 
  'Content-Type': 'application/x-www-form-urlencoded' 
};

function toUser(dto: UserReadDto): User {
  return {
    id: dto.id,
    email: dto.email,
    isActive: dto.is_active,
    isSuperuser: dto.is_superuser,
    isVerified: dto.is_verified,
  };
}

/**
 * Adapter concreto para la API FastAPI (fastapi-users). Habla en HTTP/DTOs
 * crudos y traduce hacia/desde los modelos de dominio definidos en AuthApiPort.
 * La sesión vive en una cookie httpOnly que setea el propio backend
 * (`/auth/cookie/login`); este adapter nunca lee ni almacena el JWT.
 */
@Injectable()
export class FastApiAuthAdapter implements AuthApiPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  login(email: string, password: string): Observable<void> {
    const body = new HttpParams().set('username', email).set('password', password);

    return this.http.post<void>(`${this.baseUrl}/auth/cookie/login`, body.toString(), {
      headers: FORM_URL_ENCODED_HEADERS,
    });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/cookie/logout`, null);
  }

  register(email: string, password: string): Observable<User> {
    const payload: UserCreateDto = { email, password };
    return this.http.post<UserReadDto>(`${this.baseUrl}/auth/register`, payload).pipe(map(toUser));
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<UserReadDto>(`${this.baseUrl}/users/me`).pipe(map(toUser));
  }
}
