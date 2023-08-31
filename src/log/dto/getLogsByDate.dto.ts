import { IsDateString, IsNotEmpty } from "class-validator"

export class GetLogsByDateDto{
    @IsDateString()
    @IsNotEmpty()
    from: Date
    @IsDateString()
    @IsNotEmpty()
    to: Date
}