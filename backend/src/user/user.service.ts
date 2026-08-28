import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {

    constructor( private _prismaService: PrismaService, private _jwtService: JwtService) {}    

    async createUser(accountId: string, accountName: string, spotifyAccessToken: string, spotifyRefreshToken: string, expiryDate: Date) {
        try {
            const user = await this._prismaService.user.upsert({
                where: {
                    spotifyUserId: accountId
                },
                create: {
                    spotifyUserId: accountId,
                    accountName,
                    spotifyAccessToken,
                    spotifyRefreshToken: spotifyRefreshToken,
                    expiryDate
                },
                update: {
                    accountName,
                    spotifyAccessToken,
                    spotifyRefreshToken: spotifyRefreshToken,
                    expiryDate
                }
            });

            return this.generateToken(user.id);
        } catch(error: any) {
            if (error instanceof HttpException) {
                throw new InternalServerErrorException(error.message);
            }
            throw new InternalServerErrorException('Server-side error');
        }        
    }

    private generateToken(userId: string) {
        const payload = {
            sub: userId
        };

        return {
            access_token: this._jwtService.sign(payload)
        };
    }
}
