import { IsInt, IsNotEmpty, IsString } from "class-validator"

export class AddStatisticDTO{
    @IsInt()
    @IsNotEmpty()
    numberOfPlayers: number
    @IsInt()
    @IsNotEmpty()
    serverId:        number
}//