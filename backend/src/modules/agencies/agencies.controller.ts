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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { IsPublic } from 'src/common/decorators/is-public.decorator';
import { AgencyResponseDto } from './dto/agency-response.dto';

@ApiTags('Agencies')
@Controller('agencies')
@ApiBearerAuth('access-token')
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cria uma nova agência' })
  create(@Body() createAgencyDto: CreateAgencyDto): Promise<AgencyResponseDto> {
    return this.agenciesService.create(createAgencyDto);
  }

  @IsPublic()
  @Get()
  @ApiOperation({ summary: 'Lista todas as agências (Paginado)' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.agenciesService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma agência pelo ID' })
  findOne(@Param('id') id: string): Promise<AgencyResponseDto> {
    return this.agenciesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualiza os dados de uma agência' })
  update(
    @Param('id') id: string,
    @Body() updateAgencyDto: UpdateAgencyDto,
  ): Promise<AgencyResponseDto> {
    return this.agenciesService.update(id, updateAgencyDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove uma agência (Soft Delete)' })
  remove(@Param('id') id: string): Promise<AgencyResponseDto> {
    return this.agenciesService.remove(id);
  }
}
