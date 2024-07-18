import {
  IsDate,
  IsEmail,
  IsInt,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class UserProfileResponseDto {
  @IsInt()
  id: number;

  @Length(1, 64)
  @IsString()
  username: string;

  @Length(1, 200)
  @IsString()
  about: string;

  @IsUrl()
  avatar: string;

  @IsEmail()
  email: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
