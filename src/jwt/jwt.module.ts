import { JwtService } from './jwt.service';

import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interfaces';
import { CONFIG_OPTIONS } from './jwt.constants';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        {
          // we can provide here a string instead a service
          // provide: JwtService,
          provide: CONFIG_OPTIONS,
          // useClass: JwtService,
          useValue: options,
        },
        // same as prev
        // {
        // we can provide here a string instead a service
        // provide: JwtService,
        // useClass: JwtService,
        // },
        // same as prev
        JwtService,
      ],
      exports: [JwtService],
    };
  }
}
