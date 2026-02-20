import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingServiceProtocol } from '../../auth/hashing/hashing.service';
import { UserResponseDto } from './dto/response-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/enums/audit-action.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingServiceProtocol,
    private readonly auditService: AuditService, // <-- Injetando Auditoria
  ) {}

  private mapToDto(entity: User | User[]): any {
    return plainToInstance(UserResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  async create(createUserDto: CreateUserDto, currentUser?: User) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
      withDeleted: true,
    });
    if (existingUser) {
      throw new ConflictException('Email já cadastrado.');
    }

    const hashedPassword = await this.hashingService.hash(
      createUserDto.password,
    );

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    if (currentUser) {
      await this.auditService.logAction(
        currentUser,
        AuditAction.CREATE,
        'User',
        savedUser.id,
        null,
        savedUser,
      );
    }

    return this.mapToDto(savedUser);
  }

  async findAll(queryDto: FindUsersDto) {
    const { limit = 10, offset = 0, search, role } = queryDto;

    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :search', {
            search: `%${search}%`,
          }).orWhere('user.email ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    query.orderBy('user.createdAt', 'DESC');

    query.take(limit);
    query.skip(offset);

    const [results, total] = await query.getManyAndCount();

    return {
      data: this.mapToDto(results),
      count: total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    return this.mapToDto(user);
  }

  async findByEmailForAuth(email: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
        withDeleted: true,
      });

      if (emailExists) {
        throw new ConflictException('Este email já está em uso.');
      }
    }

    const oldUser = { ...user };

    const updatedUser = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!updatedUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    const savedUser = await this.userRepository.save(updatedUser);

    await this.auditService.logAction(
      currentUser,
      AuditAction.UPDATE,
      'User',
      savedUser.id,
      oldUser,
      savedUser,
    );

    return this.mapToDto(savedUser);
  }

  async remove(id: string, currentUser: User) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    const oldUser = { ...user };

    await this.userRepository.softRemove(user);

    await this.auditService.logAction(
      currentUser,
      AuditAction.DELETE,
      'User',
      id,
      oldUser,
      null,
    );

    return { message: 'Usuário removido com sucesso' };
  }
}
