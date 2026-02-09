import { Global, Module } from '@nestjs/common';
import { HashingServiceProtocol } from './hashing/hashing.service';
import { BCryptSerivce } from './hashing/bcrypt.service';

@Global()
@Module({
  providers: [
    {
      provide: HashingServiceProtocol,
      useClass: BCryptSerivce,
    },
  ],
  exports: [HashingServiceProtocol],
})
export class AuthModule {}
