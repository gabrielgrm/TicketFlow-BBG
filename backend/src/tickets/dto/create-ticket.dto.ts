import { IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { TICKET } from '../../common/constants';

export class CreateTicketDto {
  @IsString()
  @MinLength(TICKET.MIN_TITLE_LENGTH)
  title: string;

  @IsString()
  @MinLength(TICKET.MIN_DESCRIPTION_LENGTH)
  description: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;
}
