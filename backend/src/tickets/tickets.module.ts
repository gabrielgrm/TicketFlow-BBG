import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommentsModule } from '../comments/comments.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, CommentsModule, AuditLogModule],
  providers: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {}
