import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ListTicketsDto } from './dto/list-tickets.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto, @CurrentUser() user: RequestUser) {
    return this.ticketsService.create(createTicketDto, user.id, user.role);
  }

  @Get()
  async findAll(@Query() listTicketsDto: ListTicketsDto, @CurrentUser() user: RequestUser) {
    return this.ticketsService.findAll(listTicketsDto, user.id, user.role);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.ticketsService.findById(id, user.id, user.role);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.ticketsService.update(id, updateTicketDto, user.id, user.role);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.ticketsService.delete(id, user.id, user.role);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') ticketId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.commentsService.create(ticketId, createCommentDto, user.id);
  }
}
