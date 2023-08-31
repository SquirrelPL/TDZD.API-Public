import { Strategy } from 'passport-discord';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import passport = require('passport');

type JwtPayload = {
  sub: String
  email: String
  brandUser: number
  currentBrand: number
}
//
@Injectable()
export class DiscordLinkStrategy extends PassportStrategy(
  Strategy,
  'discord-link',
) {
  constructor(
    @Inject("DISCORD_STRATEGY_CONFIG2")
    private readonly discordStrategyConfigFactory2,
    private readonly configServie: ConfigService,
    private readonly prismaService: PrismaService,
    private authService: AuthService,
    config: ConfigService
  ) {
    super(
      discordStrategyConfigFactory2,
      async (
        request: any,
        accessToken: string,
        refreshToken: string,
        profile: any,
        done,
      ) => {
        const { state } = request.query
        return done(null, profile)
      }
  );
  passport.use(this)
  }

}