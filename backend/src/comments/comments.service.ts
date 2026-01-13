import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(ticketId: string, createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    // Check if ticket exists
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const comment = await this.prisma.comment.create({
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

    // Log da criação do comentário
    await this.auditLogService.logCommentAction(
      'COMMENT_ADD',
      comment.id,
      ticketId,
      userId,
      { content: comment.content },
    );

    return comment;
  }
}
