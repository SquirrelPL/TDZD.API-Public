import { IsEmail, IsNotEmpty, IsString, IsInt, IsHexColor } from "class-validator";

export class CreateBrandDto{
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    discordGuildId: string;

    @IsString()
    @IsNotEmpty()
    discordCode: string;
    
    @IsString()
    @IsHexColor()
    primaryColor: string;

    @IsString()
    @IsHexColor()
    secondaryColor: string;

    @IsString()
    @IsHexColor()
    tertiaryColor: string;
}