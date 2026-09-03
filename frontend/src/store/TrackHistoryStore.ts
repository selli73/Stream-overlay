import { TrackHistorySession } from "../service/TrackHistorySession";

export class TrackHistoryStore {
    async getStreamTracks(spotifyUserId: string) {
        const response = await TrackHistorySession.getStreamTracks(spotifyUserId);
        return response.data;
    }
}