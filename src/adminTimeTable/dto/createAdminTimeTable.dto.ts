import { IsNotEmpty, IsNumber } from "class-validator"

export class CreateAdminTimeTableDto{
    @IsNotEmpty()
    @IsNumber()
    serverId: number
    @IsNotEmpty()
    @IsNumber()
    roleId:   number
    @IsNotEmpty()
    @IsNumber()
    minimumTime: number
}
//