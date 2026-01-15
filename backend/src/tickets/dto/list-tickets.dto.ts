import { IsOptional, IsInt, Min, IsEnum, IsString } from 'class-validator';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { Type, Transform } from 'class-transformer';
import { PAGINATION } from '../../common/constants';

export class ListTicketsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = PAGINATION.DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = PAGINATION.DEFAULT_LIMIT;

  @IsOptional()
  @Transform(({ value }) => value as TicketStatus)
  @IsEnum(TicketStatus, { message: 'Status deve ser: OPEN, IN_PROGRESS ou DONE' })
  status?: TicketStatus;

  @IsOptional()
  @Transform(({ value }) => value as TicketPriority)
  @IsEnum(TicketPriority, { message: 'Prioridade deve ser: LOW, MEDIUM, HIGH ou URGENT' })
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}
