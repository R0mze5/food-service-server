import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { getRepository, Repository } from 'typeorm';
import { EmailVerification } from './entities/email-verification.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn().mockImplementation(() => 'someToken'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;
  let emailVerificationsRepository: MockRepository<EmailVerification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(EmailVerification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);

    userRepository = module.get(getRepositoryToken(User));
    emailVerificationsRepository = module.get(
      getRepositoryToken(EmailVerification),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0,
    };

    const createEmailVerificationArgs = { code: '1', user: createAccountArgs };

    it('should fail if user exist', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'mock ',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        ok: false,
        error: 'Account with this Email already exists',
      });
    });

    it('should create a new user', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.create.mockReturnValue(createAccountArgs);
      userRepository.save.mockResolvedValue(createAccountArgs);
      emailVerificationsRepository.create.mockReturnValue(
        createEmailVerificationArgs,
      );
      emailVerificationsRepository.save.mockResolvedValue(
        createEmailVerificationArgs,
      );

      const result = await service.createAccount(createAccountArgs);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(emailVerificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(emailVerificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(emailVerificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(emailVerificationsRepository.save).toHaveBeenCalledWith(
        createEmailVerificationArgs,
      );

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        createAccountArgs.email,
        expect.any(String),
      );

      expect(result).toMatchObject({ ok: true });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        ok: false,
        error: "Couldn't create account",
      });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: '',
      password: '123',
    };
    it('should fail if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(undefined);

      const result = await service.login(loginArgs);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        { email: loginArgs.email },
        { select: ['id', 'password'] },
      );

      expect(result).toMatchObject({
        ok: false,
        error: 'Wrong credentials',
      });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };

      userRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArgs);

      expect(mockedUser.checkPassword).toHaveBeenCalledTimes(1);
      expect(mockedUser.checkPassword).toHaveBeenCalledWith(loginArgs.password);

      expect(result).toMatchObject({
        ok: false,
        error: 'Wrong credentials',
      });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };

      userRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArgs);

      expect(jwtService.sign).toBeCalledTimes(1);
      expect(jwtService.sign).toBeCalledWith({ id: expect.any(Number) });
      expect(result).toMatchObject({ ok: true, token: expect.any(String) });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error('smth'));

      const result = await service.login(loginArgs);

      expect(result).toMatchObject({
        ok: false,
        error: Error('smth'),
      });
    });
  });

  describe('editUserProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'test@test.com',
        emailVerified: true,
      };

      const editProfileArgs = {
        userId: 1,
        input: { email: 'new@test.com' },
      };

      const newVerification = {
        code: 'code',
      };

      const newUser = {
        email: editProfileArgs.input.email,
        emailVerified: false,
      };

      userRepository.findOne.mockResolvedValue(oldUser);
      emailVerificationsRepository.create.mockReturnValue(newVerification);
      emailVerificationsRepository.save.mockResolvedValue(newVerification);

      const result = await service.editUserProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      );

      expect(emailVerificationsRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });

      expect(emailVerificationsRepository.save).toHaveBeenCalledWith(
        newVerification,
      );

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );

      expect(userRepository.save).toHaveBeenCalledWith(newUser);

      expect(result).toMatchObject({
        ok: true,
      });
    });

    it('should change the password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'newPass' },
      };

      const oldUser = {
        email: 'test@test.com',
        emailVerified: true,
      };

      userRepository.findOne.mockResolvedValue(oldUser);

      const result = await service.editUserProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );

      expect(userRepository.save).toBeCalledTimes(1);
      expect(userRepository.save).toBeCalledWith({
        ...oldUser,
        ...editProfileArgs.input,
      });

      expect(result).toMatchObject({
        ok: true,
      });
    });

    it('should fail on exception', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'newPass' },
      };

      userRepository.findOne.mockRejectedValue(new Error());

      const result = await service.editUserProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );

      expect(result).toMatchObject({
        ok: false,
        error: 'Could not update profile',
      });
    });
  });

  describe('verifyEmail', () => {
    const code = 'code';

    it('should return error if verification does not exists', async () => {
      emailVerificationsRepository.findOne.mockResolvedValue(undefined);

      const result = await service.verifyEmail(code);

      expect(emailVerificationsRepository.findOne).toBeCalledTimes(1);
      expect(emailVerificationsRepository.findOne).toBeCalledWith(
        { code },
        {
          relations: ['user'],
        },
      );

      expect(result).toMatchObject({
        ok: false,
        error: "code doesn't exists",
      });
    });

    it('should verify email', async () => {
      const oldVerification = {
        user: { id: 1, emailVerified: false },
        id: 3,
      };

      emailVerificationsRepository.findOne.mockResolvedValue(oldVerification);

      const result = await service.verifyEmail(code);

      expect(emailVerificationsRepository.findOne).toBeCalledTimes(1);
      expect(emailVerificationsRepository.findOne).toBeCalledWith(
        { code },
        {
          relations: ['user'],
        },
      );

      expect(userRepository.update).toBeCalledTimes(1);
      expect(userRepository.update).toBeCalledWith(oldVerification.user.id, {
        ...oldVerification.user,
        emailVerified: true,
      });

      expect(emailVerificationsRepository.delete).toBeCalledTimes(1);
      expect(emailVerificationsRepository.delete).toBeCalledWith(
        oldVerification.id,
      );

      expect(result).toMatchObject({
        ok: true,
      });
    });

    it('should fail on exception', async () => {
      emailVerificationsRepository.findOne.mockRejectedValue(new Error());

      const result = await service.verifyEmail(code);

      expect(result).toMatchObject({
        ok: false,
        error: 'Could not verify email',
      });
    });
  });

  describe('findUserById', () => {
    it('should fail if user does not exists', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error());

      const result = await service.findUserById(1);

      expect(result).toMatchObject({
        ok: false,
        error: 'User not found',
      });
    });

    it('should find existing user', async () => {
      const mockedUser = {
        id: 1,
        email: 'mock ',
      };
      userRepository.findOneOrFail.mockResolvedValue(mockedUser);

      const result = await service.findUserById(1);

      expect(result).toMatchObject({
        ok: true,
        user: mockedUser,
      });
    });
  });
});
