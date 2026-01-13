import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto & { password: string }): Promise<Omit<User, 'passwordHash'>> {
    const { password, ...rest } = createUserDto as any;
    const user = await this.prisma.user.create({
      data: {
        ...rest,
        passwordHash: password,
      },
    });
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'passwordHash'>;
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
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

  async findTechnicians(): Promise<Pick<User, 'id' | 'name' | 'email' | 'role'>[]> {
    return this.prisma.user.findMany({
      where: { role: 'TECH' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }
}
