import { Injectable } from '@nestjs/common';
import { HashingServiceProtocol } from './hashing.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BCryptService extends HashingServiceProtocol {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async compare(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
