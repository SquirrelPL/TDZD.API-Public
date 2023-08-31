import { IsDateString, IsNotEmpty } from "class-validator"

export class GetByDateDto{
    @IsNotEmpty()
    @IsDateString()
    from: Date
    @IsNotEmpty()
    @IsDateString()
    to: Date
}
//