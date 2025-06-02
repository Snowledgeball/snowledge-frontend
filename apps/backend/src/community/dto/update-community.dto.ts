import {
	IsInt,
	IsOptional,
	IsString,
	MinLength,
	IsArray,
} from 'class-validator';

export class UpdateCommunityDto {
	@IsString()
	@MinLength(2, { message: 'Le nom doit faire au moins 2 caractères.' })
	name: string;

	@IsArray()
	@IsString({ each: true })
	tags: string[];

	@IsString()
	communityType: 'free' | 'paid';

	@IsInt()
	@IsOptional()
	price?: number;

	@IsInt()
	@IsOptional()
	yourPercentage?: number;

	@IsInt()
	@IsOptional()
	communityPercentage?: number;

	@IsString()
	description: string;

	@IsString()
	codeOfConduct: string;
}
