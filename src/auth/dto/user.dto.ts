import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { type } from "os";
//
export type UserEntity = {
	id: number
	createdAt: Date
	updatedAt: Date
	email: string
	discordId: string
	steamId: string
	discordUsername: string
	discordDiscriminator: string
	discordAvatarUrl: string
	isActive: boolean
	brandUser: {
		id: number
		userId: number
		brandId: number
		isAdmin: boolean
		vallet: {
			id: number,
            createdAt: Date
            updatedAt: Date
			level: number
			experience: number
			coin: number
			cash: number
			brandUserId: number
		},
		role: [
			{
				discordRoleId: string
				name: string
				group: string
				color: string
				power: number
			}
		],
		tempRole: [{
            id: number,
            expirationDate: Date,
            brandUserId: number,
            roleId: number,
        }],
		server: [{
            id: number,
            brandId: number,
            name: string,
            sId: number,
            game: string,
            support_id: string,
            ip: string,
            port: string,
        }],
		strike: [{
            id: number,
            reason: string,
            authorId: number,
        }],
		warn: [{
            id: number,
            reason: string,
            authorId: number,
        }],
		vacation: [{
            id: number,
            createdAt: Date,
            updatedAt: Date,
            reason: string,
            authorId: number,
            startOfVacation: Date,
            lifeSpan: number,
            endOfVacation: Date,
        }]
	}
}

