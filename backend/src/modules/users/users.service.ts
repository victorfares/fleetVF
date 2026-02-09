import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingServiceProtocol } from '../../auth/hashing/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingServiceProtocol,
  ) {}
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

    return await this.userRepository.save(user);

    return 'This action adds a new user';
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    return user;
  }

  async findByEmailForAuth(email: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password') // Traz a senha oculta para comparar
      .getOne();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

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
    return await this.userRepository.save(updatedUser);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return await this.userRepository.softRemove(user);
  }
}
