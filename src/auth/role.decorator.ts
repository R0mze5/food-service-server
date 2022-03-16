import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

export type ALLOWED_ROLES = keyof typeof UserRole | 'Any';

export const Role = (roles: ALLOWED_ROLES[]) => SetMetadata('roles', roles);
