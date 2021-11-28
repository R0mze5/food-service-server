import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { EmailVerification } from './entities/email-verification.entity';
// import { JwtService } from 'src/jwt/jwt.service';

// we shouldn't import JwtService cause it's global
// Config service available get data form .env
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      EmailVerification,
    ]) /* ConfigService */ /* JwtService */,
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
