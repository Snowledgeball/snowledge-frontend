import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, IsEmail, IsDate, IsOptional, IsInt, MaxLength } from "class-validator";
import { Gender } from "src/shared/enums/Gender";

export class CreateSnowTestRegisterDto {
        @ApiProperty({
            type: String,
        })
        @IsString()
        firstname: string;
    
        @ApiProperty({
            type: String,
        })
        @IsString()
        lastname: string;
    
        @ApiProperty({
            type: String,
        })
        @IsString()
        expertise: string;

        @ApiProperty({
            type: String,
        })
        @IsInt()
        communitySize: number;

        @ApiProperty({
            type: [String],
        })
        @MaxLength(5, {
            each: true,
        })
        platforms: string[];

        @ApiProperty({
            type: String,
        })
        @IsEmail()
        email: string;
      
        @ApiProperty({
            type: String,
        })
        @IsString()
        @IsOptional()
        referrer?: string;
}
