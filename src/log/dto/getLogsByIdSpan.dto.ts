import { IsNotEmpty, IsNumber } from "class-validator"

export class GetMultipleLogsByIdSpanDto{
    @IsNotEmpty()
    @IsNumber()
    from: number
    @IsNotEmpty()
    @IsNumber()
    to: number
}