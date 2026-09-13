import { TrackHistorySession } from "../service/TrackHistorySession";

export class TrackHistoryStore {
    async getStreamTracks(spotifyUserId: string, page: number, limit: number) {
        const response = await TrackHistorySession.getStreamTracks(spotifyUserId, page, limit);
        return response.data;
    }
}