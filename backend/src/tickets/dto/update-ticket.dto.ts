import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { TICKET } from '../../common/constants';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @MinLength(TICKET.MIN_TITLE_LENGTH)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(TICKET.MIN_DESCRIPTION_LENGTH)
  description?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  assignedToId?: string | null;
}
