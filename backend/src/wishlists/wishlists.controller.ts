import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Wishlist } from './entities/wishlist.entity';
import { WishInterceptor } from 'src/interceptors/wish.interceptor';

@UseInterceptors(WishInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  async create(
    @Request() req,
    @Body() createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    return await this.wishlistsService.create(req.user.id, createWishlistDto);
  }

  @Get()
  findAll(): Promise<Wishlist[]> {
    return this.wishlistsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Wishlist> {
    return await this.wishlistsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Request() req,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    return await this.wishlistsService.update(
      id,
      req.user.id,
      updateWishlistDto,
    );
  }

  @Delete(':id')
  async removeOne(@Param('id') id: number, @Request() req): Promise<Wishlist> {
    return await this.wishlistsService.removeOne(id, req.user.id);
  }
}
