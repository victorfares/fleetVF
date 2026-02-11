import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgenciesModule } from '../modules/agencies/agencies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarsModule } from '../modules/cars/cars.module';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from '../common/filters/http-exception.filter';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/modules/users/users.module';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RentalsModule } from 'src/modules/rentals/rentals.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: configService.get<any>('DB_TYPE'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),

        autoLoadEntities: configService.get<string>('DB_AUTOLOAD') === 'true',
        synchronize: configService.get<string>('DB_SYNC') === 'true', // nao usar em producao
      }),
    }),
    AgenciesModule,
    CarsModule,
    AuthModule,
    UsersModule,
    RentalsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
