import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
