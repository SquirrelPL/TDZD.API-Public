import { IsEmail, IsOptional, IsString, IsBoolean, IsDateString, IsNotEmpty } from "class-validator"

export class StrikeDto{
    @IsString()
    @IsNotEmpty()
    reason: string

    @IsDateString()
    @IsNotEmpty()
    expirationDate: Date

}
//