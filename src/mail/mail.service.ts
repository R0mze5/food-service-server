import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { EmailVars, MailModuleOptions } from './mail.interfaces';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    // this.sendEmail('asd', 'roman.rs.kh@gmail.com', 'sdf', '1231f3i');
  }

  async sendEmail(
    subject: string,
    to: string,
    emailVars: EmailVars[],
    template: 'verify-email',
  ): Promise<boolean> {
    const formData = new FormData();

    formData.append(
      'from',
      `Mailgun Sandbox <postmaster@${this.options.emailDomain}>`,
    );
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('template', template);
    emailVars.forEach((eVar) => formData.append(`v:${eVar.key}`, eVar.value));

    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.emailDomain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: formData,
        },
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    // console.log({email, code})
    this.sendEmail(
      'Verify your Email',
      email,
      [
        { key: 'code', value: code },
        { key: 'username', value: email },
      ],
      'verify-email',
    );
  }
}
