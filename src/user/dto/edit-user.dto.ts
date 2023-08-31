import { IsEmail, IsOptional, IsString, IsBoolean } from "class-validator"

export class EditUserDto{
    @IsEmail()
    @IsString()
    @IsOptional()
    email?: string

    @IsBoolean()
    @IsOptional()
    isAdmin?: boolean

    @IsOptional()
    steamId?: string | null

    @IsOptional()
    discordId?: string | null
}