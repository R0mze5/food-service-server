import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import * as jwt from 'jsonwebtoken';
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions, // private readonly configService: ConfigService,
  ) {}
  sign(payload: Record<string, unknown>): string {
    return jwt.sign(payload, this.options.privateKey);
  }

  verify(token: string): string | jwt.JwtPayload {
    try {
      return jwt.verify(token, this.options.privateKey);
    } catch (error) {}
  }
}
