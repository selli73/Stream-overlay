import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SpotifyAuthService } from "./spotify-auth.service";

@Injectable()
export class SpotifyTokenService {
    constructor(private _prismaService: PrismaService, private _spotifyAuthService: SpotifyAuthService) {}

    async getValidAccessToken(userId: string, forceRefresh = false): Promise<string> {
        const user = await this._prismaService.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user || !user.spotifyAccessToken) {
            throw new UnauthorizedException('Вы не авторизованы')
        }

        const isExpired = new Date() >= new Date(user.expiryDate.getTime() - 60000)
        if (!isExpired && !forceRefresh) {
            return user.spotifyAccessToken                
        }
        
        const { spotifyAccessToken, expiryDate } = await this._spotifyAuthService.accessTokenUpdate(user.spotifyRefreshToken);
        
        await this._prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                spotifyAccessToken,
                expiryDate
            }
        });

        return spotifyAccessToken;
    }
}