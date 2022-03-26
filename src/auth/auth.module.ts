import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
  imports: [UsersModule],
})
export class AuthModule {}
