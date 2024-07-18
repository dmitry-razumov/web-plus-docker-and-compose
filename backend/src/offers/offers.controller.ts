import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UserInterceptor } from 'src/interceptors/user.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Offer } from './entities/offer.entity';

@UseGuards(UserInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  async create(
    @Request() req,
    @Body() createOfferDto: CreateOfferDto,
  ): Promise<Offer> {
    return await this.offersService.create(req.user.id, createOfferDto);
  }

  @Get()
  async findAll(): Promise<Offer[]> {
    return await this.offersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Offer> {
    return await this.offersService.findOne(id);
  }
}
