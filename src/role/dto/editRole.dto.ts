import { IsInt, IsOptional, IsString } from "class-validator"

export class EditRoleDto{
    @IsString()
    @IsOptional()
    discordRoleId?: string

    @IsString()
    @IsOptional()
    name?: string


    @IsInt()
    @IsOptional()
    power?: number

    @IsString()
    @IsOptional()
    group?: string

    @IsString()
    @IsOptional()
    color?: string  
}//