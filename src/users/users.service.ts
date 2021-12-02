import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountDto,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginDto, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
// import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { EmailVerification } from './entities/email-verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(EmailVerification)
    private readonly emailVerifications: Repository<EmailVerification>,
    // private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountDto): Promise<CreateAccountOutput> {
    try {
      const isExist = await this.users.findOne({ email });
      if (isExist) {
        return { ok: false, error: 'Account with this Email already exists' };
      }

      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.emailVerifications.save(
        this.emailVerifications.create({
          user,
        }),
      );

      this.mailService.sendVerificationEmail(email, verification.code);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async editUserProfile(
    userId: number,
    editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);

      if (editProfileInput.email && editProfileInput.email !== user.email) {
        user.email = editProfileInput.email;
        user.emailVerified = false;
        const verification = await this.emailVerifications.save(
          this.emailVerifications.create({
            user,
          }),
        );

        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (editProfileInput.password) {
        user.password = editProfileInput.password;
      }

      await this.users.save(user);
      // await this.users.update({ id: userId }, { ...editProfileInput });

      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error,
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const emailVerification = await this.emailVerifications.findOne(
        { code },
        { relations: ['user'] },
      );

      if (!emailVerification?.user) {
        return {
          ok: false,
          error: "code doesn't exists",
        };
      }

      const { user, id } = emailVerification;

      user.emailVerified = true;

      this.users.update(user.id, user);

      this.emailVerifications.delete(id);

      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);

      return {
        ok: false,
        error,
      };
    }
  }

  async login({ email, password }: LoginDto): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );

      if (!user) {
        return {
          ok: false,
          error: 'Wrong credentials',
        };
      }

      const isPasswordCorrect = await user.checkPassword(password);

      if (!isPasswordCorrect) {
        return {
          ok: false,
          error: 'Wrong credentials',
        };
      }

      // const token = jwt.sign({ id: user.id }, this.config.get(process.env.TOKEN_SECRET));
      // const token = jwt.sign({ id: user.id }, this.config.get('TOKEN_SECRET'));

      const token = this.jwtService.sign({ id: user.id });
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  // async findUserById(id: number): Promise<User | undefined> {
  //   return this.users.findOne({ id });
  // }

  async findUserById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail(id);

      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'User not found',
      };
    }
  }
}
