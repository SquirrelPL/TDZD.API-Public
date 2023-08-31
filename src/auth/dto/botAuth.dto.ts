import { IsEmail, IsInt, IsNotEmpty, IsString } from "class-validator";

export class BotAuthDto{
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsInt()
    @IsNotEmpty()
    brandId: number;
}//