import { IsNotEmpty, IsNumber } from "class-validator";

export class EditAdminTimeTableDto{

    @IsNotEmpty()
    @IsNumber()
    minimumTime?: number
}
//