import { IsEmail, IsNotEmpty, IsString, IsInt } from "class-validator";

export class AuthDto{
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    password2: string;

    //@IsInt()
    @IsNotEmpty()
    brandId: number;
}//