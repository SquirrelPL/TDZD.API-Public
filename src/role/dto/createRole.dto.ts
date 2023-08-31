import { IsInt, IsNotEmpty, IsString } from "class-validator"
import { Transform } from 'class-transformer';

export class CreateRoleDto{
    @IsString()
    @IsNotEmpty()
    discordRoleId: string

    @IsString()
    @IsNotEmpty()
    name: string


    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    power: number

    @IsString()
    @IsNotEmpty()
    group: string

    @IsString()
    @IsNotEmpty()
    color: string  
}//