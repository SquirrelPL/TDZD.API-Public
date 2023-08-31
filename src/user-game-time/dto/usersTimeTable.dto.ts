import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested, IsInt, IsDateString, IsString } from 'class-validator';

export class UserTimeTableDto{
    @IsNotEmpty()
    @IsString()
    steamId: string
    @IsNotEmpty()
    @IsString()
    joinedTime: Date
    @IsNotEmpty()
    @IsString()
    timeSpend: string | number
}
//