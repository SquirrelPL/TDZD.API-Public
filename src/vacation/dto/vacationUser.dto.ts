import { IsEmail, IsOptional, IsString, IsBoolean, IsDateString, IsNotEmpty } from "class-validator"

export class VacationDto{
    @IsString()
    @IsNotEmpty()
    reason: string

    @IsDateString()
    @IsNotEmpty()
    startOfVacation: Date

    @IsDateString()
    @IsNotEmpty()
    endOfVacation: Date
}
//