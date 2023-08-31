import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { GetUser, Permission } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { SystemService } from './system.service';


@Controller('system')
export class SystemController {
    constructor(private systemService: SystemService){}


    @Permission(false, "user.seeMySelf")
    @Post('first/startup')
    startup(){
        return this.systemService.startup();
    }
}
///