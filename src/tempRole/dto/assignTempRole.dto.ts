import { IsInt, IsNotEmpty, IsDateString } from "class-validator"

export class AssignTempRoleDTO{
    @IsInt()
    @IsNotEmpty()
    brandUserId: number
    @IsDateString()
    @IsNotEmpty()
    expirationDate: Date
    @IsInt()
    @IsNotEmpty()
    roleId:        number
}
//