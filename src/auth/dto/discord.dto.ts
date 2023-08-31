

  import { IsEmail, IsNotEmpty, IsString, IsInt } from "class-validator";

export class DiscordDto{
    @IsString()
    @IsNotEmpty()
    id: string
    @IsString()
    @IsNotEmpty()
    username: string
    @IsString()
    @IsNotEmpty()
    discriminator: string
    @IsInt()
    @IsNotEmpty()
    brandId: number
}//