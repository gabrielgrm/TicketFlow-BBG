import { IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { TicketStatus, TicketPriority } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;
}
