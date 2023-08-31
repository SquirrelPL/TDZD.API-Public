import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { PrismaModule } from "src/prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy";
import { DiscordStrategy } from "./strategy/discord.strategy";
import { DiscordLinkStrategy } from "./strategy/linkDiscord.strategy";
import { SteamLinkAuthGuard } from "./guard/steam.link.guard";
import { SteamLinkStrategy } from "./strategy/linkSteam.strategy";
import { ConfigService } from "@nestjs/config";
import * as passport from "passport";
//
const discordStrategyConfigFactory = {
    provide: 'DISCORD_STRATEGY_CONFIG',
    useFactory: (configService: ConfigService) => {
        return {
            clientID: configService.get('DISCORD_CLIENT_ID'),
            clientSecret: configService.get('DISCORD_CLIENT_SECRET'),
            callbackURL: `${configService.get('API_DOMAIN')}/auth/redirect`,
            scope: ['identify'],
            passReqToCallback: true,
        }
    },
    inject: [ConfigService]
}

const discordStrategyConfigFactory2 = {
    provide: 'DISCORD_STRATEGY_CONFIG2',
    useFactory: (configService: ConfigService) => {
        return {
            clientID: configService.get('DISCORD_CLIENT_ID'),
            clientSecret: configService.get('DISCORD_CLIENT_SECRET'),
            callbackURL: `${configService.get('API_DOMAIN')}/auth/discord/redirect`,
            scope: ['identify', 'guilds.join', 'role_connections.write'],
            passReqToCallback: true,
        }
    },
    inject: [ConfigService]
}

const steamStrategyConfigFactory = {
    provide: 'STEAM_STRATEGY_CONFIG',
    useFactory: (configService: ConfigService) => {
        return {
            returnURL: `${configService.get('API_DOMAIN')}/auth/steam/redirect`,
            realm: `${configService.get('API_DOMAIN')}`,
            apiKey: configService.get('STEAM_TOKEN'),
            passReqToCallback: true,
        }
    },
    inject: [ConfigService]
}

@Module({
    imports: [JwtModule.register({}), PassportModule],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, discordStrategyConfigFactory, discordStrategyConfigFactory2,steamStrategyConfigFactory, DiscordStrategy, DiscordLinkStrategy, SteamLinkStrategy]
})
export class AuthModule implements NestModule{
    constructor(private configService: ConfigService){}
    public configure(consumer: MiddlewareConsumer){
        const discordLoginOptions = {
            session: false,
            scope: ['identify'],
            callbackURL: `${this.configService.get('API_DOMAIN')}/auth/redirect`,
            state: null,
        };

        consumer.apply(
            (req: any, res: any, next: () => void) => {
                const {
                    query: { state },
                } = req;
                discordLoginOptions.state = state;
                next()
            },
            passport.authenticate('discord', discordLoginOptions)
        ).forRoutes('/auth/redirect');


        const discordLoginOptions2 = {
            session: false,
            scope: ['identify', 'guilds.join', 'role_connections.write'],
            callbackURL: `${this.configService.get('API_DOMAIN')}/auth/discord/redirect`,
            state: null,
        };
        consumer.apply(
            (req: any, res: any, next: () => void) => {
                const {
                    query: { state },
                } = req;
                discordLoginOptions2.state = state;
                next()
            },
            passport.authenticate('discord-link', discordLoginOptions2)
        ).exclude({path: '/auth/redirect', method: RequestMethod.GET}).forRoutes('/auth/discord/redirect');

        const steamLoginOptions = {
            session: false,
            returnURL: `${this.configService.get('API_DOMAIN')}/auth/steam/redirect`,
            state: null,
        };
        consumer.apply(
            (req: any, res: any, next: () => void) => {
                const {
                    query: { state },
                } = req;
                steamLoginOptions.state = state;
                next()
            },
            passport.authenticate('steam-link', steamLoginOptions)
        ).exclude({path: '/auth/redirect', method: RequestMethod.GET}).forRoutes('/auth/steam/redirect');
    }
}