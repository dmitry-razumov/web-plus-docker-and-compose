import {
  IsArray,
  IsDate,
  IsInt,
  IsNumber,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { Offer } from 'src/offers/entities/offer.entity';

export class UserWishesDto {
  @IsInt()
  id: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @Length(1, 250)
  @IsString()
  name: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image: string;

  @IsNumber()
  price: number;

  @IsNumber()
  raised: number;

  @IsInt()
  copied: number;

  @Length(1, 1024)
  @IsString()
  description: string;

  @IsArray()
  offers: Offer[];
}
