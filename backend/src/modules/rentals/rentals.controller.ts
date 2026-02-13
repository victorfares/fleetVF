import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { FindRentalsDto } from './dto/find-rentals.dto';

@Controller('rentals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  create(@Body() createRentalDto: CreateRentalDto, @Req() req: any) {
    const user = req.user;
    if (user.role === UserRole.CLIENT) {
      createRentalDto.userId = user.id;
    }

    return this.rentalsService.create(createRentalDto);
  }

  @Get()
  findAll(@Query() query: FindRentalsDto, @Req() req: any) {
    return this.rentalsService.findAll(query, req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.rentalsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRentalDto: UpdateRentalDto,
  ) {
    return this.rentalsService.update(id, updateRentalDto);
  }

  @Patch(':id/check-in')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  checkIn(@Param('id', ParseUUIDPipe) id: string) {
    return this.rentalsService.checkIn(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rentalsService.remove(id);
  }
}
