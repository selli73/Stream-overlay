import { Module } from "@nestjs/common";
import { SpotifyApiService } from "./spotify-api.service";
import { SpotifyAuthService } from "./spotify-auth.service";
import { SpotifyTokenService } from "./spotify-token.service";
import { SpotifyApiController } from "./spotify-api.controller";

@Module({
    controllers: [SpotifyApiController],
    providers: [SpotifyApiService, SpotifyAuthService, SpotifyTokenService],
    exports: [SpotifyApiService, SpotifyAuthService]
})
export class SpotifyModule {}