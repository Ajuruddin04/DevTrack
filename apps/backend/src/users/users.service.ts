import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const defaultUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
      },
      select: defaultUserSelect,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: defaultUserSelect,
    });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: defaultUserSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: defaultUserSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async comparePasswords(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findById(id);

    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const dataToUpdate: any = Object.assign({}, updateUserDto);
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: defaultUserSelect,
    });
  }

  async delete(id: number) {
    await this.findById(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: `User with ID ${id} successfully deleted` };
  }
}
