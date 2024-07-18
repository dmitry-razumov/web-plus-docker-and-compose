import {
  IsDate,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class SignupUserResponseDto {
  @IsInt()
  id: number;

  @IsString()
  @Length(1, 64)
  username: string;

  @IsString()
  @IsOptional()
  @Length(1, 200)
  about: string;

  @IsUrl()
  @IsOptional()
  avatar: string;

  @IsEmail()
  email: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
