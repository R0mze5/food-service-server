import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailVerification } from 'src/users/entities/email-verification.entity';

jest.mock('got', () => {
  return { post: jest.fn() };
});

const GRAPHQL_ENDPOINT = '/graphql';

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let usersRepository: Repository<User>;
  let verificationsRepository: Repository<EmailVerification>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationsRepository = module.get<Repository<EmailVerification>>(
      getRepositoryToken(EmailVerification),
    );
    await app.init();
  });

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('X-JWT', jwtToken).send({ query });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  // it('/ (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/')
  //     .expect(200)
  //     .expect('Hello World!');
  // });
  const USER_EMAIL = 'test@test.com';
  const USER_PASSWORD = 'testPassword';

  describe('createAccount', () => {
    it('should create account', () => {
      return publicTest(`mutation {
          createAccount(input: {email: "${USER_EMAIL}", password: "${USER_PASSWORD}", role: Client}) {
            ok
            error 
          }
        }`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBeTruthy();
          expect(res.body.data.createAccount.error).toBeNull();
        });
    });

    it('should fail if account exists', () => {
      return publicTest(`mutation {
          createAccount(input: {email: "${USER_EMAIL}", password: "${USER_PASSWORD}", role: Client}) {
            ok
            error 
          }
        }`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBeFalsy();
          expect(typeof res.body.data.createAccount.error).toBe('string');
        });
    });
  });

  describe('login', () => {
    it('should login with correct credentials', () => {
      return publicTest(`mutation {
        login(input: {email: "${USER_EMAIL}", password: "${USER_PASSWORD}"}) {
          ok
          error 
          token
        }
      }`)
        .expect(200)
        .expect((res) => {
          const login = res.body.data.login;

          expect(login.ok).toBeTruthy();
          expect(typeof login.token).toBe('string');
          expect(login.error).toBeNull();

          jwtToken = login.token;
        });
    });
    it('should not be able to login with wrong credentials', () => {
      return publicTest(`mutation {
        login(input: {email: "${USER_EMAIL}", password: "${USER_PASSWORD}1"}) {
          ok
          error 
          token
        }
      }`)
        .expect(200)
        .expect((res) => {
          const login = res.body.data.login;

          expect(login.ok).toBeFalsy();
          expect(login.token).toBeNull();
          expect(typeof login.error).toBe('string');
        });
    });
  });

  describe('getUserDetails', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });

    it('should return user if user exists', () => {
      return privateTest(`query {
            getUserDetails(userId: ${userId}) {
              ok,
              error,
              user {
                id
                email
                role
              }
            }
          }
          `)
        .expect(200)
        .expect((res) => {
          const { ok, error, user } = res.body.data.getUserDetails;
          expect(ok).toBeTruthy();
          expect(error).toBeNull();
          expect(user?.id).toBe(userId);
        });
    });

    it('should not find profile if user not exists', () => {
      const userId = -1;
      return privateTest(`query {
            getUserDetails(userId: ${userId}) {
              ok,
              error,
              user {
                id
                email
                role
              }
            }
          }
          `)
        .expect(200)
        .expect((res) => {
          const { ok, error, user } = res.body.data.getUserDetails;
          expect(ok).toBeFalsy();
          expect(typeof error).toBe('string');
          expect(user).toBeNull();
        });
    });
  });

  describe('getProfile', () => {
    it('should not return profile if authorized', () => {
      return privateTest(`{
            getProfile {
              email,
            }
          }`)
        .expect(200)
        .expect((res) => {
          const getProfile = res.body.data.getProfile;

          expect(getProfile.email).toBe(USER_EMAIL);
        });
    });

    it('should not return profile if not authorized', () => {
      return publicTest(`query {
            getProfile {
              email,
              password
            }
          }`)
        .expect(200)
        .expect((res) => {
          const body = res.body;

          expect(body.data).toBeNull();
          expect(typeof body.errors[0].message).toBe('string');
        });
    });
  });

  describe('editProfile', () => {
    const NEW_EMAIL = 'admin@admin.com';
    it('should change email', () => {
      return privateTest(`mutation{
          editProfile(input: {email: "${NEW_EMAIL}"}) {
            ok
            error
          }
        }`)
        .expect(200)
        .expect((res) => {
          const editProfile = res.body.data.editProfile;

          expect(editProfile.ok).toBeTruthy();
          expect(editProfile.error).toBeNull();
        });
    });
    it('should have new email', () =>
      privateTest(`{
            getProfile {
              email,
            }
          }`)
        .expect(200)
        .expect((res) => {
          const getProfile = res.body.data.getProfile;

          expect(getProfile.email).toBe(NEW_EMAIL);
        }));
  });
  describe('verifyEmail', () => {
    let verificationCode;
    beforeAll(async () => {
      const [verification] = await verificationsRepository.find();
      verificationCode = verification.code;
    });

    it('should fail on wrong verification code', () => {
      return privateTest(`mutation{
            verifyEmail(input: {code: "verificationCode"}) {
            ok
            error
          }
        }`)
        .expect(200)
        .expect((res) => {
          const verifyEmail = res.body.data.verifyEmail;

          expect(verifyEmail.ok).toBeFalsy();
          expect(typeof verifyEmail.error).toBe('string');
        });
    });

    it('should verify email', () => {
      return privateTest(`mutation{
            verifyEmail(input: {code: "${verificationCode}"}) {
            ok
            error
          }
        }`)
        .expect(200)
        .expect((res) => {
          const verifyEmail = res.body.data.verifyEmail;

          expect(verifyEmail.ok).toBeTruthy();
          expect(verifyEmail.error).toBeNull();
        });
    });
  });
});
