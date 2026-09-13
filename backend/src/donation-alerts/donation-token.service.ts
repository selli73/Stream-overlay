import { HttpService } from "@nestjs/axios";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom } from "rxjs";
import { AuthService } from "../user/auth.service";
import { PrismaService } from "../prisma/prisma.service";


@Injectable()
export class DonationTokenService {
    constructor(private _httpService: HttpService, private _configService: ConfigService, 
        private _authService: AuthService, private _prismaService: PrismaService) {}

    async getValidDonAlertAccessToken(userId: string, forceRefresh = false): Promise<string> {
        const user = await this._authService.getUser(userId);

        if (!user.donationAlertsAccessToken || !user.donationAlertsExpiryDate) {
            throw new UnauthorizedException('Вы не авторизованы в Donation Alerts');
        }
        
        const isExpired = new Date() > new Date(user.donationAlertsExpiryDate.getTime() - 60000);

        if (!isExpired && !forceRefresh) {
            return user.donationAlertsAccessToken;
        }

        if (!user.donationAlertsRefreshToken) {
            throw new BadRequestException('To receive donations, re-authenticate with DonationAlerts')
        }
        
        const { donAlertAccessToken, expiresIn, donAlertRefreshToken } = await this.accessTokenUpdate(user.donationAlertsRefreshToken);

        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);

        await this._prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                donationAlertsAccessToken: donAlertAccessToken,
                donationAlertsExpiryDate: expiryDate,
                donationAlertsRefreshToken: donAlertRefreshToken
            }
        });

        return donAlertAccessToken;
    }

    async accessTokenUpdate(refreshToken: string) {
        const response = await lastValueFrom(this._httpService.post('https://www.donationalerts.com/oauth/token', new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this._configService.getOrThrow('DONATIONALERTS_CLIENT_ID'),
            client_secret: this._configService.getOrThrow('DONATIONALERTS_CLIENT_SECRET'),
            scope: this._configService.getOrThrow('SCOPER_DONATIONALERTS')
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, validateStatus: (status) => status === 200 || status === 401 }));

        if (response.status === 401) {
            throw new UnauthorizedException('Refresh token потух, авторизуйтесь в DonationAlerts заново');
        }
        
        return {
            donAlertAccessToken: response.data.access_token,
            donAlertRefreshToken: response.data.refresh_token,
            expiresIn: response.data.expires_in
        };
    }
}