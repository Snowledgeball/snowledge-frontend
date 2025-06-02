import { IsInt, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateVoteDto {
	@IsInt()
	proposalId: number;

	@IsInt()
	userId: number;

	@IsString()
	choice: 'for' | 'against';

	@IsOptional()
	@IsString()
	@MaxLength(400)
	comment?: string;

	@IsOptional()
	@IsString()
	formatChoice?: 'for' | 'against';

	@IsOptional()
	@IsString()
	@MaxLength(400)
	formatComment?: string;
}
