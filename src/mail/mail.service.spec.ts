import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';
import * as FormData from 'form-data';
import got from 'got';

jest.mock('got');
jest.mock('form-data');

const TEST_DOMAIN = 'testDomain';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'string',
            emailDomain: TEST_DOMAIN,
            fromEmail: 'string',
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('be defined', () => {
    expect(module).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should send email', () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'email',
      };

      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);

      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify your Email',
        sendVerificationEmailArgs.email,
        [
          { key: 'code', value: sendVerificationEmailArgs.code },
          { key: 'username', value: sendVerificationEmailArgs.email },
        ],
        'verify-email',
      );
    });
  });

  describe('sendEmail', () => {
    it('should send email', async () => {
      const mockSendVars = [{ key: '1', value: '1' }];
      const result = await service.sendEmail(
        '',
        '',
        mockSendVars,
        'verify-email',
      );

      const formAppendSpy = jest.spyOn(FormData.prototype, 'append');
      const gotSpy = jest.spyOn(got, 'post');

      expect(formAppendSpy).toHaveBeenCalledTimes(4 + mockSendVars.length);

      expect(gotSpy).toHaveBeenCalledTimes(1);
      expect(gotSpy).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );

      expect(result).toBeTruthy();
    });

    it('should fail on error', async () => {
      jest.spyOn(got, 'post').mockRejectedValue(new Error());

      const result = await service.sendEmail('', '', [], 'verify-email');

      expect(result).toBeFalsy();
    });
  });
});
