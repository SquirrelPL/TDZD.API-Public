import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto, BotAuthDto, DiscordDto, FindDto, LoginDto } from "./dto";
import * as argon from 'argon2'
import { JwtService } from "@nestjs/jwt/dist";
import { ConfigService } from "@nestjs/config";
import { throwError } from "rxjs";
import { DiscordStrategy } from "./strategy/discord.strategy";
import { MyLogger } from "./logger/logger.middleware";
//
type JwtPayload = {
    sub: String
    email: String
    brandUser: number
    currentBrand: number
  }

@Injectable()
export class AuthService {
    logger: MyLogger;
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService){
        this.logger = new MyLogger(prisma);
    }

    async linkDiscord(state: string, discordId: string, profile: any){
        if(!state) return new ForbiddenException("Nie został podany klucz!").getResponse()
        const jwtService = new JwtService
        const decodedJwt = jwtService.decode(state) as JwtPayload;
        const currentBrandId = decodedJwt.currentBrand;
        const brandUserId = decodedJwt.brandUser;
        try{
            const user2 = await this.prisma.user.findUnique({
                where:{
                    discordId
                }
            })
            if(user2.discordId == discordId) return new ForbiddenException("Jest juz taki uzytkownik z tym id").getResponse()
        }catch{
        }



        const brandUser = await this.prisma.brandUser.findUnique({
            where:{
                id: brandUserId
            }
        })

        const user = await this.prisma.user.update({
            where:{
                id: brandUser.userId
            },
            data:{
                discordId,
                discordAvatarUrl: `https://cdn.discordapp.com/avatars/${discordId}/${profile.avatar}?size=`,
                discordUsername: profile.username,
                discordDiscriminator: profile.discriminator
            }
        })

        return {linked: true}
    }

    async linkSteam(state: string, steamId: string, profile: any){
        console.log(state)
        const jwtService = new JwtService
        const decodedJwt = jwtService.decode(state) as JwtPayload;
        const currentBrandId = decodedJwt.currentBrand;
        const brandUserId = decodedJwt.brandUser;
        console.log("1")
        try{
            const user2 = await this.prisma.user.findUnique({
                where:{
                    steamId
                }
            })
            if(user2.steamId == steamId) return new ForbiddenException("Jest juz taki uzytkownik z tym id").getResponse()
        }catch{
        }

        console.log("2")

        const brandUser = await this.prisma.brandUser.findUnique({
            where:{
                id: brandUserId
            }
        })

        console.log("3")

        const user = await this.prisma.user.update({
            where:{
                id: brandUser.userId
            },
            data:{
                steamId
            }
        })

        console.log("4")

        return {linked: true}
    }

    async signinViaDiscord(details: DiscordDto, state: string){
        if(!state || state == "") return new ForbiddenException('Organizacja nie została wybrana!').getResponse()
        
        const brandId = parseInt(state)

       const user = await this.prisma.user.findUnique({
           where:{
               discordId: details.id
           }
       })
       if (!user) return new ForbiddenException('Nie ma takiego konta').getResponse()

       let brandUser = await this.prisma.brandUser.findFirst({
           where: {
               userId: user.id,
               brandId
           }
       })
       
       if (!brandUser) {
        return new ForbiddenException('Nie ma takiego konta').getResponse()
       }


       this.logger.save({
        brandId: brandId,
           title: 'Logowanie', 
           description: `Użytkownik ${user.discordUsername} z id: ${user.id} zalogował się`
       })
       return this.signToken(user.id, user.email, brandId, brandUser.id)
    }

    async singup(dto: AuthDto){
        if(dto.password != dto.password2) return new ForbiddenException("Hasło muszą być takie same").getResponse()

        //Minimum eight characters, at least one letter, one number and one special character
        const re = new RegExp(/^(?=.*\d)(?=.*[?!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/);
                              
        if(!dto.password.match(re)){ return new ForbiddenException("Hasło musi posiadać: 8 znaków, 1 literę, 1 znak specialny").getResponse()}

        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })

        
        const brand = await this.prisma.brand.findUnique({
            where: {
                id: dto.brandId
            }
        })
    
        if (!brand) return new ForbiddenException("Organizacja w której próbujesz stworzyć konto nie istnieje :sadpepe:").getResponse()

        if (!user) {
            const hash = await argon.hash(dto.password);
    
            
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash
                },
            })
            if(!user) return new ForbiddenException('?');


   

            delete user.hash;

            const brandUser = await this.prisma.brandUser.create({
                data: {
                    user: {
                        connect: {
                            id: user.id
                        }
                    },
                    brand: {
                        connect: {
                            id: dto.brandId
                        }
                    },
                    role: {
                        connect: {id: 1}
                    }
                }
            })

            const userVallet = await this.prisma.economy.create({
                data: {
                    brandUser: {
                        connect: {
                            id: brandUser.id
                        }
                    }
                }
            })

            return brandUser;
        } else {
            const user2 = await this.prisma.user.findUnique({
                where: {
                    id: user.id
                },
                select: {
                    brandUser: {
                        select: {
                            brandId: true
                        }
                    }
                }
            })

            if (user2.brandUser.find((brandUser) => brandUser.brandId === dto.brandId)) {
                return new ForbiddenException('Takie konto już istnieje! 0.o');
            }

            const brandUser = await this.prisma.brandUser.create({
                data: {
                    user: {
                        connect: {
                            id: user.id
                        }
                    },
                    brand: {
                        connect: {
                            id: dto.brandId
                        }
                    }
                }
            })

            const userVallet = await this.prisma.economy.create({
                data: {
                    brandUser: {
                        connect: {
                            id: brandUser.id
                        }
                    }
                }
            })

            return brandUser;
        }
    }

    async signin(dto: LoginDto){
        const user = await this.prisma.user.findFirst({
            where:{
                email: dto.email,
            }
        })
        if (!user) return new ForbiddenException('Nie ma takiego konta (╯ ͠° ͟ʖ ͡°)╯┻━┻').getResponse()
        if (!user?.isActive) return new ForbiddenException('Te konto zostało wyłączone ಠ_ಠ, jeśli jest to potencjalny błąd zgłoś to na naszym discordzie lub napisz do nas email: trafilesdozlejdzielnicy@gmail.com').getResponse()

        let brandUser = await this.prisma.brandUser.findFirst({
            where: {
                userId: user.id,
                brandId: dto.brandId
            }
        })
        
        if (!brandUser) {
            brandUser = await this.prisma.brandUser.create({
                data: {
                    user: {
                        connect: {
                            id: user.id
                        }
                    },
                    brand: {
                        connect: {
                            id: dto.brandId
                        }
                    }
                }
            })
        }

        if(!brandUser.isAdmin){return new ForbiddenException('Ale że nie jesteś adminem?').getResponse()}
        const pwMatches = await argon.verify(user.hash, dto.password)
        if (!pwMatches) return new ForbiddenException('Coś się tu nie zgadza ╭( ๐ _๐)╮').getResponse()

        this.logger.save({
            brandId: brandUser.brandId,
            title: 'Logowanie', 
            description: `Użytkownik ${user.discordUsername} z id: ${user.id} zalogował się`
        })
        return this.signToken(user.id, user.email, dto.brandId, brandUser.id)
    }
    
    async signToken(userId: number, email: string, brandId: number, brandUserId): Promise<{access_token: string}>{
        const payload = {
            sub: userId,
            email,
            brandUser: brandUserId,
            currentBrand: brandId
        }
        const secret = this.config.get('JWT_SECRET')
        
        const user = await this.prisma.user.findFirst({
            where:{
                id: userId,
                isActive: true
            }
        })
        if(!user) throw new ForbiddenException('Twoje konto zostało dezaktywowane jesli jest to błąd skontaktuj się z administratorem Sieci');

        const token = await this.jwt.signAsync(payload,{
            expiresIn: '1d',
            secret: secret,
        });
        return {access_token: token};
    }

    async createBot(dto: BotAuthDto): Promise<{id: number, access_token: string} | string | object> {
        const brand = await this.prisma.brand.findUnique({
            where: {
                id: dto.brandId
            }
        })
    
        if (!brand) return new ForbiddenException("Organizacja w której próbujesz stworzyć konto nie itnieje :sadpepe:").getResponse()

        try{
            const hash = await argon.hash(dto.password);

            var user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash
                },
            });
        }catch(error){
            if(error.code === 'P2002'){
                throw new ForbiddenException('Coś się tu nie zgadza ╭( ๐ _๐)╮');
            }else{throw error;}
        }   

        const brandUser = await this.prisma.brandUser.create({
            data: {
                user: {
                    connect: {
                        id: user.id
                    }
                },
                brand: {
                    connect: {
                        id: dto.brandId
                    }
                }
            }
        })

        const payload = {
            sub: user.id,
            email: user.email,
            brandUser: brandUser.id,
            currentBrand: dto.brandId
        }
        const secret = this.config.get('JWT_SECRET')
    

        const token = await this.jwt.signAsync(payload,{
            secret: secret,
        });
        return {id: user.id,access_token: token};
    }



}