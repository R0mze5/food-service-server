import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { JwtService } from 'src/jwt/jwt.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { ALLOWED_ROLES } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<ALLOWED_ROLES>(
      'roles',
      context.getHandler(),
    );

    if (typeof roles === 'undefined') return true;

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;

    if (!token) return false;

    const decoded = this.jwtService.verify(token.toString());
    try {
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { user } = await this.userService.findUserById(decoded.id);

        if (!user) return false;

        gqlContext['user'] = user;

        if (roles.includes('Any')) return true;

        return roles.includes(user.role);
      }
    } catch {}

    return false;
  }
}

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(private readonly reflector: Reflector) {}
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const roles = this.reflector.get<ALLOWED_ROLES>(
//       'roles',
//       context.getHandler(),
//     );

//     if (typeof roles === 'undefined') return true;

//     const gqlContext = GqlExecutionContext.create(context).getContext();
//     console.log({ context });

//     const user: User = gqlContext['user'];

//     if (!user) return false;

//     if (roles.includes('Any')) return true;

//     return roles.includes(user.role);
//   }
// }
