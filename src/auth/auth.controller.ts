import { Body, Controller, Get, HttpCode, Param, Post, Query, Redirect, Req, Res, UseGuards } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common/enums";
import { Request, Response } from 'express';
import { AuthService } from "./auth.service";
import { GetUser, Permission } from "./decorator";
import { AuthDto, BotAuthDto, LoginDto } from "./dto";
import { JwtGuard, RolesGuard } from "./guard";
import { DiscordAuthGuard } from "./guard/discord.guard";
import { GetBrand } from "./decorator/get-used-brand.decorator";
import { ConfigService } from "@nestjs/config";
import { DiscordLinkGuard } from "./guard/discord.link.guard";
import { SteamLinkAuthGuard } from "./guard/steam.link.guard";
import { UserEntity } from "./dto/user.dto";
//
@Controller('auth')
export class AuthController{
    constructor(private authService: AuthService, private config: ConfigService){}

    //rejestracja
    @Post('signup')
    async signup(@Body() dto: AuthDto) {
        const newDto: AuthDto = {
            email: dto.email,
            password: dto.password,
            password2: dto.password2,
            brandId: parseInt(dto.brandId.toString())
        }
        const result = await this.authService.singup(newDto)
       return result
    }

    //logowanie
    @HttpCode(HttpStatus.OK)
    @Post('signin')
    async signin(@Body() dto: LoginDto){
        const newDto: LoginDto = {
            email: dto.email,
            password: dto.password,
            brandId: parseInt(dto.brandId.toString())
        }
        const result = await this.authService.signin(newDto) 

        return result
    }

   //logowanie przez dc
   @UseGuards(DiscordAuthGuard)
   @Get('signinDc')
   signInViaDiscord() {
       return;
   }

    //@UseGuards(DiscordAuthGuard)
    //@Get('redirect')
    //redirect(@Res() res, @Body() dto){
    //    res.header({
    //        user: res.req.user
    //    })
    //    if(res.req.user.statusCode){
    //        res.redirect(`${this.config.get('DOMAIN_STRING')}/auth/login?error=${res.req.user.message}`)
    //    }else{
    //        res.cookie('access_token', JSON.stringify(res.req.user.access_token).slice(1, -1), {expires: new Date(Date.now() + (24 * 60 * 60 * 1000))})
    //        res.redirect(`${this.config.get('DOMAIN_STRING')}`)
    //    }
//
    //}

    @Get('redirect')
    @Redirect()
    async redirect(@Req() req,@Res() res , @Param('provider') provider: string, @Query() state: any){
        const result: any = await this.authService.signinViaDiscord(req.user, state.state);
        return {
            statusCode: HttpStatus.FOUND,
            url: `${this.config.get('DOMAIN_STRING')}/auth/login?auth=${JSON.stringify(result.access_token).slice(1, -1)}`
        }
    }
    
    @UseGuards(DiscordLinkGuard)
    @Get('discord/link')
    linkDiscord() {
        return;
    }
 
     @Get('discord/redirect')
     async redirectLinkDiscord(@Req() req,@Res() res , @Param('provider') provider: string, @Query() state: any){
        const result: any = await this.authService.linkDiscord(state.state, req.user.id, req.user);
        res.redirect(this.config.get('DOMAIN_STRING'))
        return {
            statusCode: HttpStatus.FOUND,
            url: `${this.config.get('DOMAIN_STRING')}`
        }

     }

     @UseGuards(SteamLinkAuthGuard)
     @Get('steam/link')
     linkSteam() {
         return;
     }
  

      @Get('steam/redirect')
      redirectLinkSteam(@Req() req,@Res() res , @Param('provider') provider: string, @Query() state: any, @GetUser() user: UserEntity){
        console.log(user)
        const result: any = this.authService.linkSteam(state.state, req.user.id, req.user);
        res.redirect(this.config.get('DOMAIN_STRING'))
        return {
            statusCode: HttpStatus.FOUND,
            url: `${this.config.get('DOMAIN_STRING')}`
        }
      }

    @UseGuards(JwtGuard, RolesGuard)
    @Permission(false, "Squirrels.SuperPermission")
    @Post('create/bot')
    createBot(@Body() dto: BotAuthDto){
        return this.authService.createBot(dto);
    }
}