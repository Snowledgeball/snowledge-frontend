import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCommunityDto {
  @IsString()
  @MinLength(2, { message: 'Le nom doit faire au moins 2 caractères.' })
  name: string;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsBoolean()
  isFree: boolean;

  @IsString()
  @IsOptional()
  price?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  externalLinks?: string;
}
