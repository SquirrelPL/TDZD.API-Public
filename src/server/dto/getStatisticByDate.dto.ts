import { IsDateString, IsNotEmpty } from "class-validator"

export class GetStatisticByDateDto{
    @IsNotEmpty()
    @IsDateString()
    from: Date
    @IsNotEmpty()
    @IsDateString()
    to: Date
}//