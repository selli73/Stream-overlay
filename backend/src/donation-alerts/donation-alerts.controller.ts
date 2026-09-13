import { Controller, Get, Query, Redirect, Req, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DonationAlertsService } from "./donation-alerts.service";
import { JwtAuthGuard } from "../user/guards/jwt-auth.guard";
import type { IJwtUserRequest } from "../user/typings/user";
import { AuthService } from "../user/auth.service";
import { DonationTokenService } from "./donation-token.service";

@Controller('donation-alerts')
export class DonationAlertsController {

    constructor(private _authService: AuthService, private _donationAlertsService: DonationAlertsService, private _configService: ConfigService,
        private _donationTokenService: DonationTokenService
    ) {}

    @Get('/login')
    @Redirect()
    async login() {
        const url = 'https://www.donationalerts.com/oauth/authorize?' + new URLSearchParams({
            response_type: 'code',
            client_id: this._configService.getOrThrow('DONATIONALERTS_CLIENT_ID'),
            redirect_uri: this._configService.getOrThrow('REDIRECT_URI_DONATIONALERTS'),      
            scope: this._configService.getOrThrow('SCOPER_DONATIONALERTS')
        });
        
        return {
            url,
            statusCode: 302
        }
    }
    
    @Get('/callback')
    @UseGuards(JwtAuthGuard)
    @Redirect() 
    async callback(@Req() req: IJwtUserRequest, @Query('code') code: string) {            
        const { accessToken, refreshToken, expiresIn } = await this._donationAlertsService.exchangeCode(code); 
        await this._authService.saveDonationAlertsTokens(req.user.userId, accessToken, refreshToken, expiresIn);
        
        try {
            await this._donationAlertsService.connectUser(req.user.userId);    
        } catch(error) {             
            return { message: 'DonationAlerts авторизован, но подключение к получению донатов не удалось. Попробуйте позже.' };
        }        

        return {
            url: `${this._configService.getOrThrow('FRONTEND_URL')}/dashboard`,
            statusCode: 302
        }
    }
}