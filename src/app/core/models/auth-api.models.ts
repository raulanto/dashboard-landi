/**
 * DTOs crudos tal como los expone la API (fastapi-users), en snake_case.
 * Se mapean a los modelos de dominio (camelCase) dentro del adapter.
 */
export interface UserReadDto {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

export interface UserCreateDto {
  email: string;
  password: string;
}

export type ApiErrorDetail =
  | string
  | {
      code?: string;
      reason?: string;
    };

export interface ApiErrorBody {
  detail: ApiErrorDetail;
}
