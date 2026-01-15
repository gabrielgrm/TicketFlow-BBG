import { IsOptional, IsInt, Min, IsEnum, IsString } from 'class-validator';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { Type } from 'class-transformer';
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
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}
