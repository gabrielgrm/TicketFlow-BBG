import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserWithoutPassword, SafeUser } from '../common/types';
import { PASSWORD, ERROR_MESSAGES } from '../common/constants';
import { safeUserSelect } from '../common/selectors';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const { password, ...rest } = createUserDto;
    
    const passwordHash = await bcrypt.hash(password, PASSWORD.SALT_ROUNDS);
    
    const user = await this.prisma.user.create({
      data: {
        ...rest,
        passwordHash,
      },
    });
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findTechnicians(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      where: { role: 'TECH' },
      select: safeUserSelect,
    });
  }
}
