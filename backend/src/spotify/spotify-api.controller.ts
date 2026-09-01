import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { SpotifyApiService } from "./spotify-api.service";
import { JwtAuthGuard } from "../user/guards/jwt-auth.guard";
import type { IJwtUserRequest } from "../user/typings/user";

@Controller('spotifyApi')
export class SpotifyApiController {
    constructor(private _spotifyApiService: SpotifyApiService) {}

    @Get('/myProfile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req: IJwtUserRequest) {
        return this._spotifyApiService.getProfileById(req.user.userId);
    }

    @Get('/me/player/currently-playing')
    @UseGuards(JwtAuthGuard)
    getCurrentlyPlaying(@Req() req: IJwtUserRequest) {
        return this._spotifyApiService.getCurrentlyPlaying(req.user.userId)
    }
}