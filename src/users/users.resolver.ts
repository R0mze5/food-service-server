import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountDto,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginDto, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Query(() => User)
  @UseGuards(AuthGuard)
  // getProfile(@Context() context): Promise<boolean> {
  getProfile(@AuthUser() user: User): User {
    return user;
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountDto,
  ): Promise<CreateAccountOutput> {
    try {
      return await this.userService.createAccount(createAccountInput);
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginDto): Promise<LoginOutput> {
    return await this.userService.login(loginInput);
  }
}
