import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class EditServerDto{
    @IsOptional()
    @IsString()
    name?:       string
    @IsOptional()
    @IsInt()
    sId?:        number
    @IsOptional()    
    @IsString()
    game?:       string
    @IsOptional()
    @IsString()
    support_id?: string
    @IsOptional()
    @IsString()
    ip?:         string
    @IsOptional()
    @IsString()
    port?:       string
}//