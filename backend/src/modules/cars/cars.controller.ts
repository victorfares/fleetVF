import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { FindCarsDto } from './dto/find-cars.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { IsPublic } from 'src/common/decorators/is-public.decorator';
import { CarResponseDto } from './dto/car-response.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
@ApiTags('Cars')
@ApiBearerAuth('access-token')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cria um novo carro' })
  @ApiResponse({ status: 201, type: CarResponseDto })
  create(
    @Body() createCarDto: CreateCarDto,
    @CurrentUser() user: User,
  ): Promise<CarResponseDto> {
    return this.carsService.create(createCarDto, user);
  }

  @IsPublic()
  @Get()
  @ApiOperation({ summary: 'Lista todos os carros com paginação e filtros' })
  findAll(@Query() query: FindCarsDto) {
    return this.carsService.findAll(query);
  }

  @IsPublic()
  @Get(':id')
  @ApiOperation({ summary: 'Busca um carro pelo ID' })
  @ApiResponse({ status: 200, type: CarResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CarResponseDto> {
    return this.carsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualiza os dados de um carro' })
  @ApiResponse({ status: 200, type: CarResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCarDto: UpdateCarDto,
    @CurrentUser() user: User,
  ): Promise<CarResponseDto> {
    return this.carsService.update(id, updateCarDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Remove um carro (Soft Delete)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.carsService.remove(id, user);
  }
}
