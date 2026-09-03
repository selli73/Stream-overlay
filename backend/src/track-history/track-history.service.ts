import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IPlaybackData } from '../polling/typings';
import { AuthService } from '../user/auth.service';

@Injectable()
export class TrackHistoryService {
    constructor(private _prismaService: PrismaService, private _authService: AuthService) {}

    async recordTrack(streamSessionId: string, trackData: IPlaybackData) {
        await this._prismaService.trackHistory.create({
            data: {
                streamSessionId: streamSessionId,
                trackTitle: trackData.trackTitle,
                artists: {
                    connectOrCreate: trackData.artists.map(name => ({
                        where: { name },
                        create: { name }
                    }))
                },
                image: trackData.image,
                spotifyTrackId: trackData.idTrack
            }
        });
    }

    async getStreamTracks(spotifyUserId: string) {
        const user = await this._authService.getUserBySpotifyUserId(spotifyUserId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const session = await this._prismaService.streamSession.findFirst({ where: { userId: user.id, endTime: null } }) ?? 
            await this._prismaService.streamSession.findFirst({ where: { userId: user.id, NOT: { endTime: null } }, orderBy: { startTime: 'desc' } });

        if (!session) {
            throw new NotFoundException(`No completed streams found for user ${user.accountName}`);
        }

        return this._prismaService.trackHistory.findMany({
            where: { streamSessionId: session.id },
            orderBy: { timeAdded: 'desc' },
            include: {
                artists: {
                    select: {
                        name: true
                    }
                }
            }
        });
    }
}
