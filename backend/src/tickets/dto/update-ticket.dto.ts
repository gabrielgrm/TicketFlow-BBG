import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { TicketStatus, TicketPriority } from '@prisma/client';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
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
