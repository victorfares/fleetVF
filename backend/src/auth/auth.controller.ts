import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './hashing/dto/login.dto';
import { IsPublic } from 'src/common/decorators/is-public.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { SignupDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto);
  }
  @IsPublic()
  @Post('signup')
  @ApiOperation({ summary: 'Cria uma nova conta de Cliente' })
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }
}
