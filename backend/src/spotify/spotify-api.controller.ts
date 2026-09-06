import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { SpotifyApiService } from "./spotify-api.service";
import { JwtAuthGuard } from "../user/guards/jwt-auth.guard";
import type { IJwtUserRequest } from "../user/typings/user";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller('spotifyApi')
export class SpotifyApiController {
    constructor(private _spotifyApiService: SpotifyApiService) {}

    @Get('/myProfile')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get user profile' })
    @ApiResponse({ status: 401, description: 'Unauthorized' }) @ApiResponse({ status: 200, description: 'Profile successfully retrieved' })
    getProfile(@Req() req: IJwtUserRequest) {
        return this._spotifyApiService.getProfileById(req.user.userId);
    }

    @Get('/me/player/currently-playing')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get the currently playing track' })
    @ApiResponse({ status: 401, description: 'Unauthorized' }) @ApiResponse({ status: 200, description: 'Tracking information successfully received' })
    getCurrentlyPlaying(@Req() req: IJwtUserRequest) {
        return this._spotifyApiService.getCurrentlyPlaying(req.user.userId)
    }
}