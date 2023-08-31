
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
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
export class SteamLinkStrategy extends PassportStrategy(Strategy,'steam-link') {
  constructor(
    @Inject("STEAM_STRATEGY_CONFIG")
    private readonly steamStrategyConfigFactory,
    private readonly configServie: ConfigService,
    private readonly prismaService: PrismaService,
    private authService: AuthService,
    config: ConfigService
  ) {

    super(
      steamStrategyConfigFactory,
      async (
        req, identifier, profile, done
      ) => {
        const { state } = req.query
        console.log(req.session)
        return done(null, profile)
      }
  );
// @ts-ignore
  passport.use(this)
  }
}