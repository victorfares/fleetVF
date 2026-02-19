import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingServiceProtocol } from '../../auth/hashing/hashing.service';
import { UserResponseDto } from './dto/response-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingServiceProtocol,
  ) {}

  private mapToDto(entity: User | User[]): any {
    return plainToInstance(UserResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
  async create(createUserDto: CreateUserDto) {
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
    return this.mapToDto(savedUser);
  }

  async findAll() {
    const users = await this.userRepository.find();
    return this.mapToDto(users);
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

  async update(id: string, updateUserDto: UpdateUserDto) {
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
    const updatedUser = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });
    if (!updatedUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    const savedUser = await this.userRepository.save(updatedUser);
    return this.mapToDto(savedUser);
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    await this.userRepository.softRemove(user);
    return { message: 'Usuário removido com sucesso' };
  }
}
