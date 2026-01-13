import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
