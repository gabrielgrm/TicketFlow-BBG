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
  Request,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ListTicketsDto } from './dto/list-tickets.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto, @Request() req: any) {
    return this.ticketsService.create(createTicketDto, req.user.id, req.user.role);
  }

  @Get()
  async findAll(@Query() listTicketsDto: ListTicketsDto, @Request() req: any) {
    return this.ticketsService.findAll(listTicketsDto, req.user.id, req.user.role);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    return this.ticketsService.findById(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req: any,
  ) {
    return this.ticketsService.update(id, updateTicketDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.ticketsService.delete(id, req.user.id, req.user.role);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') ticketId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.commentsService.create(ticketId, createCommentDto, req.user.id);
  }
}
