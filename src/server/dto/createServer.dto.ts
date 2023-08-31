import { IsInt, IsNotEmpty, IsString } from "class-validator"

export class CreateServerDto{
    @IsNotEmpty()
    @IsString()
    name:       string
    @IsNotEmpty()
    @IsInt()
    sId:        number
    @IsNotEmpty()    
    @IsString()
    game:       string
    @IsNotEmpty()
    @IsString()
    support_id: string
    @IsNotEmpty() 
    @IsString()
    ip:         string
    @IsNotEmpty()
    @IsString()
    port:       string
    @IsNotEmpty()
    @IsString()
    pteroServerId:       string
    @IsNotEmpty()
    @IsString()
    pteroAuthKey:       string
}//