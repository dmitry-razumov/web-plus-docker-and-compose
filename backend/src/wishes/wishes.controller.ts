import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Wish } from './entities/wish.entity';
import { WishInterceptor } from 'src/interceptors/wish.interceptor';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req,
    @Body() createWishDto: CreateWishDto,
  ): Promise<Wish> {
    return await this.wishesService.create(req.user.id, createWishDto);
  }

  @UseInterceptors(WishInterceptor)
  @Get('last')
  async findLast(): Promise<Wish[]> {
    return await this.wishesService.findLast();
  }

  @UseInterceptors(WishInterceptor)
  @Get('top')
  async findTop(): Promise<Wish[]> {
    return await this.wishesService.findTop();
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(WishInterceptor)
  @Get(':id')
  async findOne(@Request() req, @Param('id') wishId: number): Promise<Wish> {
    return await this.wishesService.findOne(req.user.id, wishId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') wishId: number,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return await this.wishesService.update(req.user.id, wishId, updateWishDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeOne(@Request() req, @Param('id') wishId: number) {
    return await this.wishesService.removeOne(req.user.id, wishId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  async copyWish(@Request() req, @Param('id') wishId: number) {
    return await this.wishesService.copyWish(req.user.id, wishId);
  }
}
