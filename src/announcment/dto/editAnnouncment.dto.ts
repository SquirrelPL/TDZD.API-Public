import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class EditAnnouncmentDto{
    @IsOptional()
    @IsString()
    Title?:        string
    @IsOptional()
    @IsString()
    Description?:  string
    @IsOptional()
    @IsString()
    Author?:       string
    @IsOptional()
    @IsString()
    AuthorAvatar?: string
}
//