import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EncryptionService } from '../encryption/encryption.service';
@Injectable()
export class AuthService {

    constructor( private _prismaService: PrismaService, private _jwtService: JwtService, private _encryptionService: EncryptionService) {}    

    getAllUsers() {
        return this._prismaService.user.findMany({
            select: {
                id: true,
                spotifyUserId: true
            }
        });
    }

    async getUser(userId: string) {
        const user = await this._prismaService.user.findUnique({
            where: {
                id: userId
            },
            select: {
                spotifyUserId: true,
                accountName: true,
                createdAt: true,
                donationAlertsAccessToken: true,
                donationAlertsRefreshToken: true,
                donationAlertsExpiryDate: true
            }
        });

        if (!user) {
            throw new NotFoundException('The user does not exist')
        }
        return {
            spotifyUserId: user.spotifyUserId,
            accountName: user.accountName,
            donationAlertsAccessToken: user.donationAlertsAccessToken ? this._encryptionService.decrypt(user.donationAlertsAccessToken) : null,
            donationAlertsRefreshToken: user.donationAlertsRefreshToken ? this._encryptionService.decrypt(user.donationAlertsRefreshToken) : null,
            donationAlertsExpiryDate: user.donationAlertsExpiryDate,
            createdAt: user.createdAt
        };        
    }

    async checkingAuthDonAler(userId: string) {
        const user = await this._prismaService.user.findUnique({
            where: {
                id: userId
            },
            select: {
                donationAlertsAccessToken: true
            }
        });

        if (!user) return null;

        return {
            donationAlertsConnected: !!user.donationAlertsAccessToken,
        }
    }

    getUserBySpotifyUserId(spotifyUserId: string) {
        return this._prismaService.user.findUnique({
            where: {
                spotifyUserId
            },
            select: {
                id: true,
                accountName: true
            }
        });
    }

    async getUsersWithDonationAlerts() {
        const existsUsers = await this._prismaService.user.findMany({
            where: {
                NOT: { donationAlertsAccessToken: null }
            },
            select: {
                id: true,
                donationAlertsAccessToken: true                
            }
        });

        const users = existsUsers.map((user) => {
            const decryptedDonationAlertsAccessToken = this._encryptionService.decrypt(user.donationAlertsAccessToken!);

            return {
                id: user.id,
                donationAlertsAccessToken: decryptedDonationAlertsAccessToken
            };
        });

        return users;
    }

    async streamerExists(spotifyUserId: string) {
        const streamer = await this._prismaService.user.findUnique({
            where: {
                spotifyUserId
            }
        });

        return streamer !== null;
    }

    async saveDonationAlertsTokens(userId: string, accessToken: string, refreshToken: string, expiryIn: number) {
        
        const encryptedDonAlerAccessToken = this._encryptionService.encrypt(accessToken);
        const encryptedDonAlerRefreshToken = this._encryptionService.encrypt(refreshToken);

        const existsUser = await this._prismaService.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true
            }
        });

        if (!existsUser) {
            throw new NotFoundException('The user does not exist');
        }

        const expiryDate = new Date();
        expiryDate.setMilliseconds(expiryDate.getSeconds() + expiryIn)

        await this._prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                donationAlertsAccessToken: encryptedDonAlerAccessToken,
                donationAlertsRefreshToken: encryptedDonAlerRefreshToken,
                donationAlertsExpiryDate: expiryDate
            }
        });
    }


    async createUser(accountId: string, accountName: string, spotifyAccessToken: string, spotifyRefreshToken: string, expiryDate: Date) {
        try {            

            const encryptedSpotifyAccessToken = this._encryptionService.encrypt(spotifyAccessToken);
            const encryptedSpotifyRefreshToken = this._encryptionService.encrypt(spotifyRefreshToken);

            const user = await this._prismaService.user.upsert({
                where: {
                    spotifyUserId: accountId
                },
                create: {
                    spotifyUserId: accountId,
                    accountName,
                    spotifyAccessToken: encryptedSpotifyAccessToken,
                    spotifyRefreshToken: encryptedSpotifyRefreshToken,
                    expiryDate
                },
                update: {
                    accountName,
                    spotifyAccessToken: encryptedSpotifyAccessToken,
                    spotifyRefreshToken: encryptedSpotifyRefreshToken,
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

    async logoutDonationAlerts(userId: string) {
        await this._prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                donationAlertsAccessToken: null,
                donationAlertsExpiryDate: null,
                donationAlertsRefreshToken: null
            }
        });

        return {
            status: 200,
            message: 'You have successfully logged out of your account'
        }
    }
}
