import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ticketId: string, createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    // Check if ticket exists
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.prisma.comment.create({
      data: {
        ...createCommentDto,
        ticketId,
        userId,
      },
      include: {
        user: true,
        ticket: true,
      },
    });
  }
}
