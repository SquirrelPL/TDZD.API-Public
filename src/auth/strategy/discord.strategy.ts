import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-discord';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from '../auth.service';
import { DiscordDto } from '../dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import passport = require('passport');

//

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(
    @Inject("DISCORD_STRATEGY_CONFIG")
    private readonly discordStrategyConfigFactory,
    private authService: AuthService,
    private prisma: PrismaService,
    config: ConfigService
  ) {
    
    super(
        discordStrategyConfigFactory,
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