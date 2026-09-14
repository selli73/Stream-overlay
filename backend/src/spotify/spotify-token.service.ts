import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SpotifyAuthService } from "./spotify-auth.service";
import { EncryptionService } from "../encryption/encryption.service";

@Injectable()
export class SpotifyTokenService {
    constructor(private _prismaService: PrismaService, private _spotifyAuthService: SpotifyAuthService, private _encryptionService: EncryptionService) {}

    async getValidAccessToken(userId: string, forceRefresh = false): Promise<string> {
        const user = await this._prismaService.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user || !user.spotifyAccessToken) {
            throw new UnauthorizedException('Вы не авторизованы');
        }

        const isExpired = new Date() >= new Date(user.expiryDate.getTime() - 60000)
        if (!isExpired && !forceRefresh) {
            const encryptedAccessToken = this._encryptionService.decrypt(user.spotifyAccessToken);
            return encryptedAccessToken                
        }
        
        const { spotifyAccessToken, expiryDate } = await this._spotifyAuthService.accessTokenUpdate(user.spotifyRefreshToken);
        
        const encryptedspotifyAccessToken = this._encryptionService.encrypt(spotifyAccessToken);

        await this._prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                spotifyAccessToken: encryptedspotifyAccessToken,
                expiryDate
            }
        });

        return spotifyAccessToken;
    }
}