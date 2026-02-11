import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AgenciesService } from './agencies.service';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';  
import { UserRole } from '../users/enums/user-role.enum';
import { IsPublic } from 'src/common/decorators/is-public.decorator';

@Controller('agencies')
@ApiBearerAuth('access-token')
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createAgencyDto: CreateAgencyDto) {
    return this.agenciesService.create(createAgencyDto);
  }

  @IsPublic()
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.agenciesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agenciesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateAgencyDto: UpdateAgencyDto) {
    return this.agenciesService.update(id, updateAgencyDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.agenciesService.remove(id);
  }
}
