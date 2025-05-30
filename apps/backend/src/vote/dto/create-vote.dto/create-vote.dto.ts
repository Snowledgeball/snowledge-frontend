import {
	IsBoolean,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
	IsInt,
} from 'class-validator';

export class CreateVoteDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(5)
	@MaxLength(80)
	title: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(10)
	@MaxLength(200)
	description: string;

	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(40)
	format?: string;

	@IsOptional()
	@IsString()
	@MaxLength(400)
	comments?: string;

	@IsOptional()
	@IsBoolean()
	isContributor?: boolean;

	@IsInt()
	communityId: number;

	@IsInt()
	submitterId: number;
}
