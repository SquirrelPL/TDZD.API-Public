import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class FindDto{
    @IsString()
    @IsNotEmpty()
    discordId: string;
}//