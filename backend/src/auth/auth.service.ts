import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './hashing/dto/login.dto';
import jwtConfig from './config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { HashingServiceProtocol } from './hashing/hashing.service';
import { UserRole } from 'src/modules/users/enums/user-role.enum';
import { SignupDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingServiceProtocol,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}
  async signIn(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailForAuth(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await this.hashingService.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    return this.generateToken(user);
  }

  async signup(signupDto: SignupDto) {
    const userExists = await this.usersService.findByEmail(signupDto.email);
    if (userExists) {
      throw new BadRequestException('Email já cadastrado.');
    }

    const newUser = await this.usersService.create({
      ...signupDto,
      role: UserRole.CLIENT,
    });

    return this.generateToken(newUser);
  }

  private async generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      aud: this.jwtConfiguration.audience,
      iss: this.jwtConfiguration.issuer,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret,
      expiresIn: this.jwtConfiguration.jwtTtl,
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
