import { IsString } from 'class-validator';

export class SigninUserResponseDto {
  @IsString()
  access_token: string;
}
