import { IsEmail, IsNotEmpty, IsString, IsInt } from "class-validator";

export class LoginDto{
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;


    @IsNotEmpty()
    brandId: number;
}//