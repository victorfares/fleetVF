import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { FindRentalsDto } from './dto/find-rentals.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Rentals')
@ApiBearerAuth('access-token')
@Controller('rentals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova locação/reserva' })
  create(@Body() createRentalDto: CreateRentalDto, @CurrentUser() user: User) {
    if (user.role === UserRole.CLIENT) {
      createRentalDto.userId = user.id;
    }

    return this.rentalsService.create(createRentalDto, user); // Passando o usuário para auditoria
  }

  @Get()
  @ApiOperation({ summary: 'Lista locações com paginação e filtros' })
  findAll(@Query() query: FindRentalsDto, @CurrentUser() user: User) {
    return this.rentalsService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma locação pelo ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.rentalsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualiza ou finaliza (devolução) uma locação' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRentalDto: UpdateRentalDto,
    @CurrentUser() user: User,
  ) {
    return this.rentalsService.update(id, updateRentalDto, user);
  }

  @Patch(':id/check-in')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Realiza o check-in (retirada) do veículo' })
  checkIn(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.rentalsService.checkIn(id, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove uma locação do sistema' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.rentalsService.remove(id, user);
  }
}
