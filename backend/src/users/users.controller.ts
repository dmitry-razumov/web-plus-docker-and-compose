import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  Request,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserInterceptor } from 'src/interceptors/user.interceptor';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { Wish } from 'src/wishes/entities/wish.entity';
import { WishInterceptor } from 'src/interceptors/wish.interceptor';
import { UserPublicProfileResponseDto } from './dto/user-public-profile-response.dto';
import { UserWishesDto } from './dto/user-wishes.dto';
import { FindUserDto } from './dto/find-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(UserInterceptor)
  @Get('me')
  async findOwn(@Request() req): Promise<UserProfileResponseDto> {
    return await this.usersService.findOneById(req.user.id);
  }

  @UseInterceptors(UserInterceptor)
  @Patch('me')
  async update(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserProfileResponseDto> {
    return await this.usersService.updateById(req.user.id, updateUserDto);
  }

  @UseInterceptors(WishInterceptor)
  @Get('me/wishes')
  async getOwnWishes(@Request() req): Promise<Wish[]> {
    return await this.usersService.findWishes(req.user.id);
  }

  @UseInterceptors(UserInterceptor)
  @Get(':username')
  findOne(
    @Param('username') username: string,
  ): Promise<UserPublicProfileResponseDto> {
    return this.usersService.findOneByUsername(username);
  }

  @UseInterceptors(WishInterceptor)
  @Get(':username/wishes')
  async getWishes(
    @Param('username') username: string,
  ): Promise<UserWishesDto[]> {
    const { id } = await this.usersService.findOneByUsername(username);
    return await this.usersService.findWishes(id);
  }

  @UseInterceptors(UserInterceptor)
  @Post('find')
  async findMany(
    @Body() findUserDto: FindUserDto,
  ): Promise<UserProfileResponseDto[]> {
    return await this.usersService.findMany(findUserDto.query);
  }
}
