import { IsEmail, IsOptional, IsString, IsBoolean, IsDateString, IsNotEmpty } from "class-validator"

export class WarnDto{
    @IsString()
    @IsNotEmpty()
    reason: string

    @IsDateString()
    @IsNotEmpty()
    expirationDate: Date

}//