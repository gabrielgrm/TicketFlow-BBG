import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from '@prisma/client';
import { ERROR_MESSAGES } from '../common/constants';
import { safeUserSelect } from '../common/selectors';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(ticketId: string, createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(ERROR_MESSAGES.TICKET_NOT_FOUND);
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        ticket: { connect: { id: ticketId } },
        user: { connect: { id: userId } },
      },
      include: {
        user: { select: safeUserSelect },
        ticket: true,
      },
    });

    this.auditLogService.logCommentAction(
      'COMMENT_ADD',
      comment.id,
      ticketId,
      userId,
      { content: comment.content },
    ).catch(err => console.error('Audit log error:', err));

    return comment;
  }
}
