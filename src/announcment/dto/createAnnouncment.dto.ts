import { IsNotEmpty, IsString } from "class-validator"

export class CreateAnnouncmentDto{
    @IsNotEmpty()
    @IsString()
    Title:        string
    @IsNotEmpty()
    @IsString()
    Description:  string
    @IsNotEmpty()
    @IsString()
    Author:       string
    @IsNotEmpty()
    @IsString()
    AuthorAvatar: string
}
//