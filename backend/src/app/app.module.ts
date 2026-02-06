import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgenciesModule } from '../modules/agencies/agencies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarsModule } from '../modules/cars/cars.module';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      database: 'fleet_db',
      password: 'adminpassword',
      autoLoadEntities: true,
      synchronize: true, //nao usar em produção
    }),
    AgenciesModule,
    CarsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
