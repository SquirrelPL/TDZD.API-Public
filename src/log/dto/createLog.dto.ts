import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateLogDto{
    @IsNotEmpty()
    @IsNumber()
    brandId: number
    @IsNotEmpty()
    @IsString()
    title:       string
    @IsNotEmpty()
    @IsString()
    description: string
    @IsOptional()
    @IsString()
    type?:        string
    @IsOptional()
    @IsString()
    color?:       string
}